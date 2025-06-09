// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import AIHubWebhook from "../controllers/webhook/ai_hub";
import HaravanWebhook from  "../controllers/webhook/haravan";
export default class WebhookRoutes {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */

    AIHubWebhook.register(webhook);
    HaravanWebhook.register(webhook);

  };
};
