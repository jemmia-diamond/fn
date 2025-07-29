import Database from "services/database";
import { orderStatusQuery } from "src/services/ecommerce/order/queries/order-status";
import { getLastOrderIdQuery } from "src/services/ecommerce/order/queries/get-last_order";
import { formatOrderResult } from "src/services/ecommerce/order/utils/format-order-result";

export default class OrderService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async trackOrder(orderId) {
    try {
      if (!orderId || isNaN(orderId)) {
        throw new Error("Invalid order ID");
      }

      const lastOrderIdQuery = getLastOrderIdQuery(orderId);
      const lastOrderIds = await this.db.$queryRawUnsafe(lastOrderIdQuery);
      const lastOrderId = lastOrderIds.length ? lastOrderIds[0].id : orderId;

      const query = orderStatusQuery(lastOrderId);
      const result = await this.db.$queryRawUnsafe(query);
      const row = result[0];
      if (!row) return null;

      return formatOrderResult(orderId, row, lastOrderId);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error("Failed to track order");
    }
  }
}
