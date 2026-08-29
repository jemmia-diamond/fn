import { verifySepayWebhook } from "auth/sepay-auth";
import SepayTransactionController from "controllers/webhook/sepay/sepay-transaction";

export default class SepayWebhook {
  static async register(webhook) {
    const sepayWebhookNamespace = webhook.basePath("/sepay");
    sepayWebhookNamespace.use("*", verifySepayWebhook);
    sepayWebhookNamespace.post("transactions", SepayTransactionController.create);
  }
}
