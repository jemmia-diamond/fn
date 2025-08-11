import Database from "services/database";
import { getOrderOverallInfo} from "services/ecommerce/order-tracking/queries/get-order-overall-info";
import { getLatestOrderId} from "services/ecommerce/order-tracking/queries/get-latest-orderid";
import { formatOrderTrackingResult } from "services/ecommerce/order-tracking/utils/format-order-tracking";

export default class OrderTrackingService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async trackOrder(orderId) {
    try {
      const parsedOrderId = parseInt(orderId, 10);

      if (isNaN(parsedOrderId) || parsedOrderId <= 0) {
        throw new Error("Invalid order ID");
      }

      const lastOrderIds = await getLatestOrderId(this.db, parsedOrderId);

      const lastOrderId = lastOrderIds.length
        ? lastOrderIds[0].id
        : parsedOrderId;
      
      if (!lastOrderId || !Number.isInteger(lastOrderId)) {
        throw new Error("Invalid order ID");
      }
      const result = await getOrderOverallInfo(this.db, lastOrderId);

      if (!result || result.length === 0) return null;
      const row = result[0];

      return await formatOrderTrackingResult(parsedOrderId, row);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error("Failed to track order");
    }
  }
}
