// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import AIHubWebhook from "controllers/webhook/ai-hub";
import HaravanWebhook from "controllers/webhook/haravan";
import FrappeWebhook from "controllers/webhook/frappe";
import PancakeWebhook from "controllers/webhook/pancake";
import InventoryCmsWebhook from "controllers/webhook/inventory-cms";
import ZaloMessageWebhook from "controllers/webhook/zalo-message";
import MisaWebhook from "controllers/webhook/misa";
import SepayWebhook from "controllers/webhook/sepay";

export default class WebhookRoutes {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */

    AIHubWebhook.register(webhook);
    HaravanWebhook.register(webhook);
    FrappeWebhook.register(webhook);
    PancakeWebhook.register(webhook);
    InventoryCmsWebhook.register(webhook);
    ZaloMessageWebhook.register(webhook);
    MisaWebhook.register(webhook);
    SepayWebhook.register(webhook);
  };
};
