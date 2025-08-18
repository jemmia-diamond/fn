import Database from "services/database";
import { getOrderOverallInfo } from "services/ecommerce/order-tracking/queries/get-order-overall-info";
import { getLatestOrderId } from "services/ecommerce/order-tracking/queries/get-latest-orderid";
import { formatOrderTrackingResult } from "services/ecommerce/order-tracking/utils/format-order-tracking";
import GetOrderStatusesListService from "services/ecommerce/order-tracking/utils/get-order-status";
import NhattinClient from "services/nhattin/nhattin-client";

export default class OrderTrackingService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async trackOrder(orderId) {
    try {
      const latestOrderId = await getLatestOrderId(this.db, orderId);

      const orderInfoRows = await getOrderOverallInfo(this.db, latestOrderId);

      if (!orderInfoRows || !orderInfoRows.length) return null;

      const orderInfo = orderInfoRows[0];

      let orderStatuses;

      const orderStatusService = new GetOrderStatusesListService(this.env);

      try {
        orderStatuses = await orderStatusService.getOrderDeliveryStatus(latestOrderId);
      } catch (e) {
        console.error(e);
      }

      return formatOrderTrackingResult(orderId, orderInfo, orderStatuses);
    } catch (error) {
      console.error("Error tracking order:", error);
      throw new Error("Failed to track order");
    }
  }

  async getNhatTinDeliveryStatus(trackingNumber) {
    try {
      if (!trackingNumber) return;

      const nhattinEmail = this.env.NHAT_TIN_LOGISTIC_EMAIL;
      const nhattinPartnerId = this.env.NHAT_TIN_PARTNER_ID;
      const nhattinBaseUrl = this.env.NHAT_TIN_API_URL;
      const nhattinPassword = await this.env.NHAT_TIN_LOGISTIC_PASSWORD_SECRET.get();

      if (!nhattinEmail || !nhattinPartnerId || !nhattinBaseUrl || !nhattinPassword) {
        throw new Error("Missing Nhattin API credentials");
      }

      const nhattinClient = new NhattinClient(
        nhattinEmail,
        nhattinPassword,
        nhattinPartnerId,
        nhattinBaseUrl
      );

      const bill = await nhattinClient.trackBill(trackingNumber);

      return bill;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
