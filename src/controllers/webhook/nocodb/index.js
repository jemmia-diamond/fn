
import { verifyStaticTokenAuth } from "auth/static-token-auth";
import CollectController from "controllers/webhook/nocodb/collect";
import DiamondsController from "controllers/webhook/nocodb/diamonds";
import ProductsController from "controllers/webhook/nocodb/products";
import SetsController from "controllers/webhook/nocodb/sets";

export default class NocoWebhook {
  static async register(webhook) {
    const nocoWebhookNamespace = webhook.basePath("/noco");
    nocoWebhookNamespace.use("*", verifyStaticTokenAuth("X-Nocodb-Webhook-Signature", "NOCODB_WEBHOOK_SECRET"));
    nocoWebhookNamespace.post("collects", CollectController.create);
    nocoWebhookNamespace.post("sets", SetsController.handle);
    nocoWebhookNamespace.post("diamonds", DiamondsController.handle);
    nocoWebhookNamespace.post("products", ProductsController.handle);
  }
}
