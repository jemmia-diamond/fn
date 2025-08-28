import Database from "services/database";
import { getOrderOverallInfo } from "services/ecommerce/order-tracking/queries/get-order-overall-info";
import { getLatestOrderId } from "services/ecommerce/order-tracking/queries/get-latest-orderid";
import { formatOrderTrackingResult } from "services/ecommerce/order-tracking/utils/format-order-tracking";
import NhattinClient from "services/nhattin/nhattin-client";
import { NhattinDeliveryStatus, NhattinPaymentMethod, OrderOverallStatus } from "services/ecommerce/order-tracking/enums/order-delivery-status.enum";
import { TrackingLog } from "services/ecommerce/order-tracking/dtos/tracking-log";
import { OrderTimelineStatus } from "services/ecommerce/order-tracking/enums/order-step-status.enum";
import HaravanClient from "services/haravan/haravan-client";
import { getInitialOrder } from "services/ecommerce/order-tracking/queries/get-initial-order";
import crypto from "crypto";
import { HTTPException } from "hono/http-exception";

export default class OrderTrackingService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async trackOrder(orderId, reqBearerToken) {
    try {

      if (reqBearerToken) {
        const firstOrder = await getInitialOrder(this.db, orderId);
        if (!firstOrder) {
          throw new HTTPException(400, { message: "first_order_not_found" });
        }

        const bearerToken = await this.env.BEARER_TOKEN_SECRET.get();
        const parsedAccessToken = this.createTokenForOrderTracking({
          order_id: firstOrder.id,
          order_number: firstOrder.order_number
        },
        bearerToken
        );

        if (parsedAccessToken !== reqBearerToken) {
          throw new HTTPException(400, { message: "invalid_access_token" });
        }
      }

      const latestOrderId = await getLatestOrderId(this.db, orderId);

      const orderInfoRows = await getOrderOverallInfo(this.db, latestOrderId);

      if (!orderInfoRows || !orderInfoRows.length) return null;

      let orderInfo = orderInfoRows[0];

      orderInfo.original_total_price = this.getOriginalTotalPrice(orderInfo);

      let nhattinTrackInfo = {};
      try {
        nhattinTrackInfo = await this.getOrderDeliveryStatus(latestOrderId);
      } catch (e) {
        console.error(e);
      }

      return formatOrderTrackingResult(orderInfo, nhattinTrackInfo, reqBearerToken !== null);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw error;
    }
  }

  getOriginalTotalPrice(order) {
    let totalOriginalPrice = 0;
    order.items.forEach(item => {
      totalOriginalPrice += Number(item.original_price || 0) * Number(item.quantity || 0);
    });
    return totalOriginalPrice;
  }

  async getNhatTinDeliveryStatus(trackingNumber) {
    try {
      if (!trackingNumber) return;

      const nhattinEmail = this.env.NHAT_TIN_LOGISTIC_EMAIL;
      const nhattinPartnerId = this.env.NHAT_TIN_PARTNER_ID;
      const nhattinBaseUrl = this.env.NHAT_TIN_API_URL;
      const nhattinPassword = await this.env.NHAT_TIN_LOGISTIC_PASSWORD_SECRET.get();

      if (!nhattinEmail || !nhattinPartnerId || !nhattinBaseUrl || !nhattinPassword) {
        throw new Error("Missing Nhattin API credentials");
      }

      const nhattinClient = new NhattinClient(
        nhattinEmail,
        nhattinPassword,
        nhattinPartnerId,
        nhattinBaseUrl
      );

      const bill = await nhattinClient.trackBill(trackingNumber);

      return bill;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getOrder(orderId) {
    const endpoint = `/com/orders/${orderId}.json`;
    const haravanApiKey = await this.env.HARAVAN_TOKEN_SECRET.get();
    const haravanClient = new HaravanClient(
      haravanApiKey,
      this.env.HARAVAN_API_BASE_URL
    );
    return haravanClient.makeRequest(endpoint);
  }

  async getOrderDeliveryStatus(orderId) {
    try {
      const { order } = await this.getOrder(orderId);

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const haravanFulfillment = this._getLatestFulfillment(order);

      const trackingNumber = haravanFulfillment.tracking_number;

      const nhattinBillTrack = trackingNumber && await this.getNhatTinDeliveryStatus(trackingNumber);

      let nhattinTrackingLog = [];
      const nhattinTrackingData = nhattinBillTrack?.data?.at(-1);
      const histories = nhattinTrackingData?.histories;
      if (histories && Array.isArray(histories)) {
        histories.forEach(historyLog => {
          nhattinTrackingLog.push(new TrackingLog(historyLog));
        });
      }

      const haravanTimeline = this._buildTimeline(order, haravanFulfillment);

      const orderedSteps = this._createOrderedSteps(haravanTimeline);

      const trackInfo = {
        bill_code: nhattinTrackingData?.bill_code,
        ref_code: nhattinTrackingData?.ref_code,
        p_link_image: nhattinTrackingData?.p_link_image,
        bill_image_link: nhattinTrackingData?.bill_image_link,
        document_image_link: nhattinTrackingData?.document_image_link,
        date_delivery: nhattinTrackingData?.date_delivery,
        date_pickup: nhattinTrackingData?.date_pickup,
        date_expected: nhattinTrackingData?.date_expected,
        payment_method: NhattinPaymentMethod[nhattinTrackingData?.pay_method],
        total_fee: nhattinTrackingData?.total_fee,
        main_fee: nhattinTrackingData?.main_fee,
        insurance_fee: nhattinTrackingData?.insurance_fee,
        cod_amt: nhattinTrackingData?.cod_amt,
        cod_fee: nhattinTrackingData?.cod_fee,
        service: nhattinTrackingData?.service
      };

      // Handle cancelled orders
      if (order.cancelled_at) {
        const status = this._handleCancelledOrder(order, orderedSteps);
        return {
          ...trackInfo,
          status: status,
          overall_status: status.find(step => step.status === OrderTimelineStatus.ONGOING).key
        };
      }

      // Handle active orders
      let finalHaravanSteps = this._handleActiveOrder(orderedSteps);

      // Filter steps which are not DELIVERING and DELIVERED if shipping address is null
      if (!order.shipping_address.address1) {
        finalHaravanSteps = finalHaravanSteps.filter(step =>
          step.key !== OrderOverallStatus.DELIVERING.key
          && step.key !== OrderOverallStatus.DELIVERED.key
        );
      }

      const takeFromVendorLogs = nhattinTrackingLog.filter(log => log.billStatusId === NhattinDeliveryStatus.TAKE_ORDER_FROM_VENDOR);

      const transitLogs = nhattinTrackingLog.filter(log => log.billStatusId === NhattinDeliveryStatus.TRANSITING);

      const combinedSteps = this.combinedSteps(
        {
          haravanSteps: finalHaravanSteps,
          takeFromVendorLogs: takeFromVendorLogs,
          transitLogs: transitLogs
        }
      );

      return {
        ...trackInfo,
        status: combinedSteps,
        overall_status: combinedSteps.find(step => step.status === OrderTimelineStatus.ONGOING).key
      };
    } catch (err) {
      console.error(`Error fetching order timeline for order ${orderId}:`, err.message);
      throw new Error(`Failed to fetch order timeline: ${err.message}`);
    }
  }

  /**
   *
   * @param {*} haravanSteps - Array logs of haravan steps
   * @param {*} takeFromVendorLogs - Array logs of taking from vendor
   * @param {*} transitLogs - Array logs of transiting
   * @returns
   */

  combinedSteps({
    haravanSteps, takeFromVendorLogs, transitLogs
  }) {

    // ready_to_confirm | confirmed | ready_to_pick
    const ongoingStep = haravanSteps.find(step => step.status === OrderTimelineStatus.ONGOING);

    if ([
      OrderOverallStatus.READY_TO_CONFIRM.key,
      OrderOverallStatus.CONFIRMED.key,
      OrderOverallStatus.READY_TO_PICK.key
    ].includes(ongoingStep.key)) {
      return haravanSteps;
    }

    const deliveringIndex = haravanSteps.findIndex(step => step.key === OrderOverallStatus.DELIVERING.key);
    if (deliveringIndex <= -1) {
      return haravanSteps;
    }

    const vendorTime = takeFromVendorLogs?.[0]?.getDateTimeObject().toISOString();
    if (vendorTime) {
      const currentStep = haravanSteps[deliveringIndex];
      if (!currentStep.time || currentStep.time > vendorTime) {
        currentStep.time = vendorTime;
      }
    }

    let beforeDeliveringSteps = haravanSteps.slice(0, deliveringIndex + 1);
    let afterDeliveringSteps = haravanSteps.slice(deliveringIndex + 1);

    // Step to receive order from vendor Jemmia
    if (takeFromVendorLogs && takeFromVendorLogs.length > 0) {
      const newStep = {
        title: takeFromVendorLogs[0].operation,
        time: takeFromVendorLogs[0].getDateTimeObject().toISOString(),
        key: OrderOverallStatus.DELIVERING.key,
        status: OrderTimelineStatus.PAST
      };

      // ready pick -> (picked) -> delivering
      const readyToPickIndex = beforeDeliveringSteps.findIndex(step => step.key === OrderOverallStatus.READY_TO_PICK.key);
      if (readyToPickIndex > -1) {
        beforeDeliveringSteps = [
          ...beforeDeliveringSteps.slice(0, readyToPickIndex + 1),
          newStep,
          ...beforeDeliveringSteps.slice(readyToPickIndex + 1)
        ];
      }
    }

    // Steps to transit order
    if (transitLogs && transitLogs.length > 0) {
      transitLogs.forEach(log => {
        const newStep = {
          title: log.operation,
          time: log.getDateTimeObject().toISOString(),
          key: OrderOverallStatus.DELIVERING.key,
          status: OrderTimelineStatus.PAST
        };
        beforeDeliveringSteps.push(newStep);
      });
    }

    // If ongoing step exists in the first half, change their status to past and change last step to ongoing
    const ongoingStepIndex = beforeDeliveringSteps.findIndex(step => step.status === OrderTimelineStatus.ONGOING);
    if (ongoingStepIndex > -1) {
      beforeDeliveringSteps = beforeDeliveringSteps.map((step, index) => {
        if (index === beforeDeliveringSteps.length - 1) {
          return { ...step, status: OrderTimelineStatus.ONGOING };
        } else {
          return { ...step, status: OrderTimelineStatus.PAST };
        }
      });
    }

    return [
      ...beforeDeliveringSteps,
      ...afterDeliveringSteps
    ];
  }

  /**
   * Get the latest fulfillment information from order
   * @private
   */
  _getLatestFulfillment(order) {
    return order.fulfillments?.[order.fulfillments.length - 1] || {};
  }

  /**
   * Build timeline object mapping status keys to timestamps
   * @private
   */
  _buildTimeline(order, fulfillment) {
    return {
      ready_to_confirm: order.created_at,
      confirmed: order.confirmed_at,
      ready_to_pick: fulfillment.ready_to_pick_date || null,
      picking: fulfillment.picking_date || null,
      delivering: fulfillment.delivering_date || null,
      delivered: fulfillment.delivered_date || null,
      cancel: fulfillment.cancel_date || null,
      not_meet_customer: fulfillment.not_meet_customer_date || null,
      waiting_for_return: fulfillment.waiting_for_return_date || null,
      return: fulfillment.return_date || null
    };
  }

  /**
   * Create ordered steps array based on OrderOverallStatus enum
   * @private
   */
  _createOrderedSteps(timeline) {
    return Object.entries(OrderOverallStatus).map(([_, statusObject]) => ({
      key: statusObject.key,
      title: statusObject.label,
      time: timeline[statusObject.key] || null
    }));
  }

  /**
   * Handle timeline for cancelled orders
   * @private
   */
  _handleCancelledOrder(order, orderedSteps) {
    const cancelledTime = new Date(order.cancelled_at);

    // Get all valid steps up to cancellation time
    const validSteps = orderedSteps
      .filter(step => step.time !== null && new Date(step.time) <= cancelledTime)
      .map(step => ({
        title: step.title,
        time: step.time,
        key: step.key,
        status: OrderTimelineStatus.PAST
      }));

    // Add cancellation step
    validSteps.push({
      title: OrderOverallStatus.CANCELLED.label,
      time: order.cancelled_at,
      status: OrderTimelineStatus.ONGOING
    });

    return validSteps;
  }

  /**
   * Handle timeline for active (non-cancelled) orders
   * @private
   */
  _handleActiveOrder(orderedSteps) {
    // Find the last step with a timestamp
    const lastFilledIndex = this._findLastFilledStepIndex(orderedSteps);

    // Filter and map steps based on their position relative to the last filled step
    const filteredSteps = orderedSteps.map((step, index) => {
      if (step.time !== null) {
        return this._createFilledStep(step, index, lastFilledIndex);
      } else {
        return this._createUnfilledStep(step, index, lastFilledIndex, orderedSteps);
      }
    });

    return filteredSteps.filter(Boolean);
  }

  /**
   * Find the index of the last step that has a timestamp
   * @private
   */
  _findLastFilledStepIndex(orderedSteps) {
    const lastFilledIndex = [...orderedSteps].reverse().findIndex(step => step.time !== null);
    return lastFilledIndex >= 0 ? orderedSteps.length - 1 - lastFilledIndex : -1;
  }

  _createFilledStep(step, index, lastFilledIndex) {
    let status = OrderTimelineStatus.UPCOMING;

    if (index < lastFilledIndex) {
      status = OrderTimelineStatus.PAST;
    } else if (index === lastFilledIndex) {
      status = OrderTimelineStatus.ONGOING;
    }

    return {
      title: step.title,
      time: step.time,
      key: step.key,
      status
    };
  }

  _createUnfilledStep(step, index, lastFilledIndex, orderedSteps) {
    const isAfterOngoing = index > lastFilledIndex;
    const deliveredIndex = orderedSteps.findIndex(s => s.key === OrderOverallStatus.DELIVERED.key);
    const isBeforeDelivered = deliveredIndex >= 0 ? index <= deliveredIndex : true;

    if (isAfterOngoing && isBeforeDelivered) {
      return {
        title: step.title,
        time: null,
        key: step.key,
        status: OrderTimelineStatus.UPCOMING
      };
    }

    if (isAfterOngoing && !isBeforeDelivered) {
      return null;
    }

    return {
      title: step.title,
      time: step.time,
      key: step.key,
      status: isAfterOngoing ? OrderTimelineStatus.UPCOMING : OrderTimelineStatus.PAST
    };
  }

  createTokenForOrderTracking(payloadObject, secret) {
    const payloadString = `${payloadObject.order_id}|${payloadObject.order_number}|${JSON.stringify(payloadObject)}`;
    const base64Payload = Buffer.from(payloadString).toString("base64url");
    const hashedToken = this.createHashForOrderTracking(payloadString, secret);
    return `${base64Payload}.${hashedToken}`;
  }

  createHashForOrderTracking(payloadString, secret) {
    const hashedToken =  this.generateHash(payloadString, secret);
    return hashedToken;
  }

  generateHash(data, secret) {
    return crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");
  }
}
