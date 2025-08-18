import HaravanClient from "services/haravan/haravan-client.js";
import { NhattinDeliveryStatus, OrderOverallStatus } from "services/ecommerce/order-tracking/enums/order-delivery-status.enum";
import { TrackingLog } from "services/ecommerce/order-tracking/dtos/tracking-log";
import { OrderTimelineStatus } from "services/ecommerce/order-tracking/enums/order-step-status.enum";

export default class GetOrderStatusesListService {
  constructor(env) {
    this.env = env;
    this.haravanClient = new HaravanClient(
      env.HARAVAN_API_KEY,
      env.HARAVAN_API_BASE_URL
    );
    this.fnNhattinDeliveryTrackingUrl = "http://fn.jemmia.vn/api/delivery/nhattin";
  }
  async getOrder(orderId) {
    const endpoint = `/com/orders/${orderId}.json`;
    return this.haravanClient.makeRequest(endpoint);
  }

  async getBillInfo(billCode) {
    const url = new URL(this.fnNhattinDeliveryTrackingUrl);
    
    url.searchParams.append("bill_code", billCode);

    const bearerToken = await this.env.BEARER_TOKEN_SECRET.get();
  
    const options = {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "Accept": "application/json"
      }
    };
  
    try {
      const response = await fetch(url, options);
  
      if (!response.ok) {
  
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      }
  
      const data = await response.json();
      return data;
  
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
      throw error;
    }
  }

  async getOrderDeliveryStatus(orderId) {
    try {
      const data = await this.getOrder(orderId);
      const order = data.order;

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const haravanFulfillment = this._getLatestFulfillment(order);

      const trackingNumber = haravanFulfillment.tracking_number;

      let nhattinBillTrack;
      if (trackingNumber) {
        nhattinBillTrack = await this.getBillInfo(trackingNumber);
      }

      let nhattinTrackingLog = [];
      if (nhattinBillTrack && nhattinBillTrack.data && nhattinBillTrack.data.length > 0) {
        const histories = nhattinBillTrack.data[nhattinBillTrack.data.length - 1].histories;
 
        if (histories && Array.isArray(histories)) {
    
          histories.forEach(historyLog => {
            nhattinTrackingLog.push(new TrackingLog(historyLog));
          });
        }
      }

      const haravanTimeline = this._buildTimeline(order, haravanFulfillment);

      const orderedSteps = this._createOrderedSteps(haravanTimeline);

      // Handle cancelled orders
      if (order.cancelled_at) {
        return this._handleCancelledOrder(order, orderedSteps);
      }

      // Handle active orders
      let finalHaravanSteps = this._handleActiveOrder(orderedSteps);

      const takeFromVendorLogs = nhattinTrackingLog.filter(log => log.billStatusId === NhattinDeliveryStatus.take_order_from_vendor);
      const transitLogs = nhattinTrackingLog.filter(log => log.billStatusId === NhattinDeliveryStatus.transiting);

      return this.combinedSteps(finalHaravanSteps, takeFromVendorLogs, transitLogs);
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

  combinedSteps(haravanSteps, takeFromVendorLogs, transitLogs) {

    // ready_to_confirm | confirmed | ready_to_pick
    const beforePickIndex = haravanSteps.findIndex(step => ["ready_to_confirm", "confirmed", "ready_to_pick"].includes(step.key) && step.status === OrderTimelineStatus.ONGOING);
    if (beforePickIndex > -1) {
      return haravanSteps;
    }
 
    const deliveringIndex = haravanSteps.findIndex(step => step.key === "delivering");
    if (deliveringIndex <= -1) {
      return haravanSteps;
    }

    let beforeDeliveringSteps = haravanSteps.slice(0, deliveringIndex + 1);
    let afterDeliveringSteps = haravanSteps.slice(deliveringIndex + 1);
  
    // Step to receive order from vendor Jemmia
    if (takeFromVendorLogs && takeFromVendorLogs.length > 0) {
      const newStep = {
        title: takeFromVendorLogs[0].operation,
        time: takeFromVendorLogs[0].getDateTimeObject().toISOString(),
        key: "delivering",
        status: OrderTimelineStatus.PAST
      };

      // ready pick -> (picked) -> delivering
      const readyToPickIndex = beforeDeliveringSteps.findIndex(step => step.key === "ready_to_pick");
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
          key: "delivering",
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
    return Object.entries(OrderOverallStatus).map(([key, title]) => ({
      key,
      title,
      time: timeline[key] || null
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
      title: OrderOverallStatus.cancelled,
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
    const deliveredIndex = orderedSteps.findIndex(s => s.key === "delivered");
    const isBeforeDelivered = deliveredIndex >= 0 ? index <= deliveredIndex : true;

    if (isAfterOngoing && isBeforeDelivered) {
      return {
        title: step.title,
        time: null,
        key: step.key,
        status: OrderTimelineStatus.UPCOMING
      };
    }

    return null;
  }
}
