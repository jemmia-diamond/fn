import CollectController from "controllers/webhook/nocodb/collect";
import DesignImagesController from "controllers/webhook/nocodb/design-images";
import DiamondsController from "controllers/webhook/nocodb/diamonds";
import HaravanCollectionsController from "controllers/webhook/nocodb/haravan-collections";
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
    nocoWebhookNamespace.post("design-images/retouch-upload", DesignImagesController.uploadRetouch);
    nocoWebhookNamespace.post("design-images/retouch-to-haravan", DesignImagesController.syncToHaravan);
    nocoWebhookNamespace.post("moissanite", MoissaniteController.create);
    nocoWebhookNamespace.post("haravan-collections", HaravanCollectionsController.create);
    nocoWebhookNamespace.post("variants", VariantsController.handle);
  }
}
