import HaravanClient from "services/haravan/haravan-client.js";
import { OrderOverallStatus } from "services/ecommerce/order-tracking/enums/order-delivery-status.enum";
import NhattinClient from "services/nhattin/nhattin-client";

export default class GetOrderStatusesListService {
  constructor(env) {
    this.haravanClient = new HaravanClient(
      env.HARAVAN_API_KEY,
      "https://apis.haravan.com"
    );
    const nhattinEmail = env.NHAT_TIN_LOGISTIC_EMAIL;
    const nhattinPassword = env.NHAT_TIN_LOGISTIC_PASSWORD;
    const nhattinPartnerId = env.NHAT_TIN_PARTNER_ID;
    const nhattinBaseUrl = env.NHAT_TIN_API_URL;

    this.nhattinClient = new NhattinClient(
      nhattinEmail,
      nhattinPassword,
      nhattinPartnerId,
      nhattinBaseUrl
    );
  }
  async getOrder(orderId) {
    const endpoint = `/com/orders/${orderId}.json`;
    return this.haravanClient.makeRequest(endpoint);
  }

  async getNhatTinDeliveryStatus(trackingNumber) {
    try {
      if (!trackingNumber) return;

      const bill = await this.nhattinClient.trackBill(trackingNumber);

      return bill;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getOrderDeliveryStatus(orderId) {
    try {
      const data = await this.getOrder(orderId);
      const order = data.order;

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const fulfillment = this._getLatestFulfillment(order);

      const trackingNumber = fulfillment.tracking_number;

      let nhattinBillTrack;
      if (trackingNumber) {
        nhattinBillTrack = await this.getNhatTinDeliveryStatus(trackingNumber);
      }

      if (nhattinBillTrack) {
        // eslint-disable-next-line no-console
        console.log(nhattinBillTrack);
      }

      const timeline = this._buildTimeline(order, fulfillment);

      const orderedSteps = this._createOrderedSteps(timeline);

      // Handle cancelled orders
      if (order.cancelled_at) {
        return this._handleCancelledOrder(order, orderedSteps);
      }

      // Handle active orders
      return this._handleActiveOrder(orderedSteps);
    } catch (err) {
      console.error(`Error fetching order timeline for order ${orderId}:`, err.message);
      throw new Error(`Failed to fetch order timeline: ${err.message}`);
    }
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
        status: "past"
      }));

    // Add cancellation step
    validSteps.push({
      title: OrderOverallStatus.cancelled_at,
      time: order.cancelled_at,
      status: "ongoing"
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
    let status = "upcoming";

    if (index < lastFilledIndex) {
      status = "past";
    } else if (index === lastFilledIndex) {
      status = "ongoing";
    }

    return {
      title: step.title,
      time: step.time,
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
        status: "upcoming"
      };
    }

    return null;
  }
}
