
import CreateProductController from "controllers/webhook/nocodb/create-product";
import RemoveProductController from "controllers/webhook/nocodb/remove-product";

export default class NocoWebhook {
  static async register(webhook) {
    const sepayWebhookNamespace = webhook.basePath("/noco");
    sepayWebhookNamespace.post("collects/create", CreateProductController.create);
    sepayWebhookNamespace.post("collects/remove", RemoveProductController.create);
  }
}
