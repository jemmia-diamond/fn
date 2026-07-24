
import CollectController from "controllers/webhook/nocodb/collect";
import SetsController from "controllers/webhook/nocodb/sets";
import DesignImagesUploadRetouchToNocoDBController from "controllers/webhook/nocodb/design-images-upload-retouch-to-nocodb";
import DesignImagesRetouchToHaravanController from "controllers/webhook/nocodb/design-images-retouch-to-haravan";

export default class NocoWebhook {
  static async register(webhook) {
    const nocoWebhookNamespace = webhook.basePath("/noco");
    nocoWebhookNamespace.post("collects", CollectController.create);
    nocoWebhookNamespace.post("sets", SetsController.handle);
    nocoWebhookNamespace.post("design-images/retouch-uploader", DesignImagesUploadRetouchToNocoDBController.handle);
    nocoWebhookNamespace.post("design-images/retouch-to-haravan", DesignImagesRetouchToHaravanController.handle);
  }
}
