import Database from "services/database";
import { getOrderOverallInfo } from "services/ecommerce/order-tracking/queries/get-order-overall-info";
import { getLatestOrderId } from "services/ecommerce/order-tracking/queries/get-latest-orderid";
import { formatOrderTrackingResult } from "services/ecommerce/order-tracking/utils/format-order-tracking";

export default class OrderTrackingService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async trackOrder(orderId) {
    try {
      const latestOrderRows = await getLatestOrderId(this.db, orderId);

      const latestOrderId = latestOrderRows.length
        ? latestOrderRows[0].id
        : orderId;

      const orderInfoRows = await getOrderOverallInfo(this.db, latestOrderId);

      if (!orderInfoRows || !orderInfoRows.length) return null;

      const orderInfo = orderInfoRows[0];

      return formatOrderTrackingResult(orderId, orderInfo);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error("Failed to track order");
    }
  }
}
