// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import AIHubWebhook from '../controllers/webhook/erp/ai_hub'
import HaravanWebhook from  '../controllers/webhook/erp/haravan'
export default class WebhookRoutes {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const jemmiaERPNamespaceApi = webhook.basePath("/erp");

    AIHubWebhook.register(jemmiaERPNamespaceApi)
    HaravanWebhook.register(jemmiaERPNamespaceApi)
  };
};
