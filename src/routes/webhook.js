// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import AIHubWebhook from "controllers/webhook/ai-hub";
import FrappeWebhook from "controllers/webhook/frappe";
import HaravanWebhook from "controllers/webhook/haravan";
import InfisicalWebhook from "controllers/webhook/infisical";
import InventoryCmsWebhook from "controllers/webhook/inventory-cms";
import LarkWebhook from "controllers/webhook/lark";
import MisaWebhook from "controllers/webhook/misa";
import NocoWebhook from "controllers/webhook/nocodb";
import PancakeWebhook from "controllers/webhook/pancake";
import SepayWebhook from "controllers/webhook/sepay";
import ZaloMessageWebhook from "controllers/webhook/zalo-message";
import ZalopayTransactionWebhook from "controllers/webhook/zalopay-transaction";

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
    NocoWebhook.register(webhook);
    ZalopayTransactionWebhook.register(webhook);
    LarkWebhook.register(webhook);
    InfisicalWebhook.register(webhook);
  }
}
