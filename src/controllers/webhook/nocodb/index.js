
import CollectController from "controllers/webhook/nocodb/collect";

export default class NocoWebhook {
  static async register(webhook) {
    const nocoWebhookNamespace = webhook.basePath("/noco");
    nocoWebhookNamespace.post("collects", CollectController.create);
  }
}
