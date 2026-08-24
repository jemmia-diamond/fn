import CollectController from "controllers/webhook/nocodb/collect";
import DiamondsController from "controllers/webhook/nocodb/diamonds";
import MoissaniteController from "controllers/webhook/nocodb/moissanite";
import ProductsController from "controllers/webhook/nocodb/products";
import SetsController from "controllers/webhook/nocodb/sets";
import VariantsController from "controllers/webhook/nocodb/variants";

export default class NocoWebhook {
  static async register(webhook) {
    const nocoWebhookNamespace = webhook.basePath("/noco");
    nocoWebhookNamespace.post("collects", CollectController.create);
    nocoWebhookNamespace.post("sets", SetsController.handle);
    nocoWebhookNamespace.post("diamonds", DiamondsController.handle);
    nocoWebhookNamespace.post("products", ProductsController.handle);
    nocoWebhookNamespace.post("moissanite", MoissaniteController.handle);
    nocoWebhookNamespace.post("variants", VariantsController.handle);
  }
}
