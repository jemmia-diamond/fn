import { verifyPancakeWebhook } from "auth/pancake-auth";
import PancakeERPMessageController from "controllers/webhook/pancake/erp/message";

export default class PancakeWebhook {
  static async register(webhook) {
    const pancakeWebhookNamespace = webhook.basePath("/pancake");

    pancakeWebhookNamespace.use("*", verifyPancakeWebhook);
    pancakeWebhookNamespace.post(
      "erp/messages",
      PancakeERPMessageController.create
    );
  }
}
