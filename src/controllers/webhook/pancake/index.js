import PancakeERPMessageController from "./erp/message";

export default class PancakeWebhook {
  static async register(webhook) {
    const pancakeWebhookNamespace = webhook.basePath("/pancake");
    pancakeWebhookNamespace.post("erp/messages", PancakeERPMessageController.create);
  }
}
