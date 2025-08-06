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

      const fulfillment = order.fulfillments?.[order.fulfillments.length - 1] || {};

      const timeline = {
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

      const orderedSteps = Object.entries(OrderOverallStatus).map(([key, title]) => ({
        key,
        title,
        time: timeline[key] || null
      }));

      // If the order is cancelled, we store all the steps up to the cancellation time
      if (order.cancelled_at) {
        const cancelledTime = new Date(order.cancelled_at);

        const validSteps = orderedSteps
          .filter(step => step.time !== null && new Date(step.time) <= cancelledTime)
          .map(step => ({
            title: step.title,
            time: step.time,
            status: "past"
          }));

        validSteps.push({
          title: OrderOverallStatus.cancelled_at,
          time: order.cancelled_at,
          status: "ongoing"
        });

        return validSteps;
      }

      // If the order is not cancelled, we determine the last filled step
      const lastFilledIndex = [...orderedSteps].reverse().findIndex(step => step.time !== null);
      const lastIndex = lastFilledIndex >= 0 ? orderedSteps.length - 1 - lastFilledIndex : -1;

      const filteredSteps = orderedSteps.map((step, index) => {
        if (step.time !== null) {
          let status = "upcoming";

          if (index < lastIndex) status = "past";
          else if (index === lastIndex) status = "ongoing";

          return {
            title: step.title,
            time: step.time,
            status
          };
        } else {
        // chỉ giữ lại các bước null nếu nó nằm **sau ongoing và trước delivered**
          const isAfterOngoing = index > lastIndex;
          const isBeforeDelivered = orderedSteps.findIndex(s => s.key === "delivered") >= index;

          if (isAfterOngoing && isBeforeDelivered) {
            return {
              title: step.title,
              time: null,
              status: "upcoming"
            };
          }

          // loại bỏ hoàn toàn nếu không thỏa 2 điều kiện trên
          return null;
        }
      });

      return filteredSteps.filter(Boolean);
    } catch (err) {
      console.error(`Error fetching order timeline ${orderId}:`, err.message);
      throw err;
    }
  }
} 
