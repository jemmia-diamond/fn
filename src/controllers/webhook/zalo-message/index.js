import OrderStatusController from "controllers/webhook/zalo-message/order-status/order-status";

export default class ZaloMessageWebhook {
  static async register(webhook) {
    const zaloMessageWebhookNamespace = webhook.basePath("/zalo_message");
    zaloMessageWebhookNamespace.post(
      "/order_status",
      OrderStatusController.create
    );
  }
}
