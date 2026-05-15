
import CollectController from "controllers/webhook/nocodb/collect";
import SetsController from "controllers/webhook/nocodb/sets";

export default class NocoWebhook {
  static async register(webhook) {
    const nocoWebhookNamespace = webhook.basePath("/noco");
    nocoWebhookNamespace.post("collects", CollectController.create);
    nocoWebhookNamespace.post("sets", SetsController.handle);
  }
}
