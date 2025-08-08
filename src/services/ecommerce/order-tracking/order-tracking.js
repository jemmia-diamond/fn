import Database from "services/database";
import { getOrderOverallInfo} from "services/ecommerce/order-tracking/queries/get-order-overall-info";
import { getLastOrderIdQuery } from "services/ecommerce/order-tracking/queries/get-last-orderid";
import { formatOrderResult } from "services/ecommerce/order-tracking/utils/format-order-result";

export default class OrderService {
  constructor(env) {
    this.env = env;
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
      
      const result = await getOrderOverallInfo(this.db,lastOrderId);

      const row = result[0];
      if (!row) return null;

      return await formatOrderResult(parsedOrderId, row, this.env);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error("Failed to track order");
    }
  }
}
