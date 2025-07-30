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
      // ✅ Validate orderId strictly
      const parsedOrderId = parseInt(orderId, 10);

      if (
        !parsedOrderId ||
        isNaN(parsedOrderId) ||
        typeof parsedOrderId !== "number"
      ) {
        throw new Error("Invalid order ID");
      }

      // 🧠 Use parsedOrderId instead of raw input
      const lastOrderIdQuery = getLastOrderIdQuery(parsedOrderId);
      const lastOrderIds = await this.db.$queryRawUnsafe(lastOrderIdQuery);

      const lastOrderId = lastOrderIds.length
        ? lastOrderIds[0].id
        : parsedOrderId;

      const query = orderStatusQuery(lastOrderId);
      const result = await this.db.$queryRawUnsafe(query);

      const row = result[0];
      if (!row) return null;

      return formatOrderResult(parsedOrderId, row, lastOrderId);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error("Failed to track order");
    }
  }
}
