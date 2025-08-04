import Database from "services/database";
import { orderStatusQuery } from "services/ecommerce/order/queries/order-info";
import { getLastOrderIdQuery } from "src/services/ecommerce/order/queries/get-last-order";
import { formatOrderResult } from "src/services/ecommerce/order/utils/format-order-result";

export default class OrderService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async trackOrder(orderId) {
    try {
      const parsedOrderId = parseInt(orderId, 10);

      if (
        !parsedOrderId ||
        isNaN(parsedOrderId) ||
        typeof parsedOrderId !== "number"
      ) {
        throw new Error("Invalid order ID");
      }

      const lastOrderIds = await getLastOrderIdQuery(this.db, parsedOrderId);

      const lastOrderId = lastOrderIds.length
        ? lastOrderIds[0].id
        : parsedOrderId;

      const result = await orderStatusQuery(this.db,lastOrderId);

      const row = result[0];
      if (!row) return null;

      return formatOrderResult(parsedOrderId, row, lastOrderId);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error("Failed to track order");
    }
  }
}
