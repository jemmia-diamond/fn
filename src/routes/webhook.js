// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import Webhook from "../controllers/webhook";
import verifyAIHubWebhook from "../auth/aihub-auth";
import verifyHaravanWebhook from "../auth/haravan-auth";
export default class WebhookRoutes {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const jemmiaERPNamespaceApi = webhook.basePath("/erp");
    jemmiaERPNamespaceApi.post("/orders", verifyHaravanWebhook, Webhook.ERP.OrderController.create);
    jemmiaERPNamespaceApi.post("/leads", verifyAIHubWebhook, Webhook.ERP.LeadController.create);
  };
};
