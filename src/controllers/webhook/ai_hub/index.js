import verifyAIHubWebhook from "../../../auth/aihub-auth";
import AIHubERPLeadController from "../ai_hub/erp/lead";
export default class AIHubWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  aiHubWebhookNamespace = webhook.basePath("/ai-hub");

    aiHubWebhookNamespace.use("*", verifyAIHubWebhook);
    aiHubWebhookNamespace.post("erp/leads", AIHubERPLeadController.update);

  };
};
