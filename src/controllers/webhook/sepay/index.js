import SepayTransactionController from "controllers/webhook/sepay/sepay-transaction";

export default class SepayWebhook {
  static async register(webhook) {
    const sepayWebhookNamespace = webhook.basePath("/sepay");
    sepayWebhookNamespace.post("transactions", SepayTransactionController.create);
  }
}
