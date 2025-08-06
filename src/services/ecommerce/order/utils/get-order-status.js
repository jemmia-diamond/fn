import HaravanClient from "services/haravan/haravan-client.js";
import { OrderOverallStatus } from "src/services/ecommerce/order/enums/order-status.enum.js";

export default class GetOrderStatusesList {
  constructor(env) {
    this.haravanClient = new HaravanClient(env);
  }

  async getStatuses(orderId) {
    const endpoint = `/com/orders/${orderId}.json`;
    return this.haravanClient.makeRequest(endpoint);
  }

  async getOrderTimeline(orderId) {
    try {
      const data = await this.getStatuses(orderId);
      const order = data.order;

      if (!order) throw new Error("Order not found");

      const now = new Date();
      const fulfillment = order.fulfillments?.[order.fulfillments.length - 1] || {};

      const timeline = {
        created_at: order.created_at,
        confirmed_at: order.confirmed_at,
        ready_to_pick: fulfillment.ready_to_pick_date || null,
        picking: fulfillment.picking_date || null,
        delivering: fulfillment.delivering_date || null,
        delivered: fulfillment.delivered_date || null,
        cancel: fulfillment.cancel_date || null,
        not_meet_customer: fulfillment.not_meet_customer_date || null,
        waiting_for_return: fulfillment.waiting_for_return_date || null,
        return: fulfillment.return_date || null,
        cancelled_at: order.cancelled_at || null
      };

      if (timeline.cancelled_at) {
        const cancelledTime = new Date(timeline.cancelled_at);
        return [
          {
            title: OrderOverallStatus.cancelled_at,
            time: timeline.cancelled_at,
            status: cancelledTime < now ? "past" : "ongoing"
          }
        ];
      }

      return Object.entries(OrderOverallStatus).map(([key, title]) => {
        const time = timeline[key];
        if (time) {
          const t = new Date(time);
          const status = t < now ? "past" : "ongoing";
          return { title, time, status };
        } else {
          return { title, time: null, status: "upcoming" };
        }
      });
    } catch (err) {
      console.error(`Error fetching order timeline ${orderId}:`, err.message);
      throw err;
    }
  }
} 
