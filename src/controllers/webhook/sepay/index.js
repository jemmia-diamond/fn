import SepayTransactionController from "controllers/webhook/sepay/sepay-transaction";

export default class SepayWebhook {
  static async register(webhook) {
    const sepayWebhookNamespace = webhook.basePath("/sepay");

    // TODO: verify webhook signature
    sepayWebhookNamespace.post("transactions", SepayTransactionController.create);
  }
}
