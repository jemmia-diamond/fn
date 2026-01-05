import ZaloPayTransactionController from "controllers/webhook/zalopay-transaction/zalopay-transaction-controller";

export default class ZalopayTransactionWebhook {
  static async register(webhook) {
    const zalopayWebhookNamespace = webhook.basePath("/zalopay");
    zalopayWebhookNamespace.post("/transactions", ZaloPayTransactionController.create);
  }
}
