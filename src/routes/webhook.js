// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import AIHubWebhook from "controllers/webhook/ai-hub";
import HaravanWebhook from  "controllers/webhook/haravan";
import FrappeWebhook from "controllers/webhook/frappe";
import PancakeWebhook from "controllers/webhook/pancake";

export default class WebhookRoutes {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */

    AIHubWebhook.register(webhook);
    HaravanWebhook.register(webhook);
    FrappeWebhook.register(webhook);
    PancakeWebhook.register(webhook);
  };
};
