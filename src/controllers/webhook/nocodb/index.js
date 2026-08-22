import { verifyNocoWebhook } from "auth/nocodb-auth";
import CollectController from "controllers/webhook/nocodb/collect";
import DiamondsController from "controllers/webhook/nocodb/diamonds";
import ProductsController from "controllers/webhook/nocodb/products";
import SetsController from "controllers/webhook/nocodb/sets";
import HaravanCollectionsController from "controllers/webhook/nocodb/haravan-collections";

export default class NocoWebhook {
  static async register(webhook) {
    const nocoWebhookNamespace = webhook.basePath("/noco");
    nocoWebhookNamespace.use("*", verifyNocoWebhook);
    nocoWebhookNamespace.post("collects", CollectController.create);
    nocoWebhookNamespace.post("sets", SetsController.handle);
    nocoWebhookNamespace.post("diamonds", DiamondsController.handle);
    nocoWebhookNamespace.post("products", ProductsController.handle);
    nocoWebhookNamespace.post("haravan-collections", HaravanCollectionsController.handle);
  }
}
