import verifyAIHubWebhook from "../../../auth/aihub-auth";
import LeadController from "../erp/lead"

export default class AIHubWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  aiHubWebhookNamespace = webhook.basePath("/ai-hub");

    aiHubWebhookNamespace.use("*", verifyAIHubWebhook);
    aiHubWebhookNamespace.post("/leads", LeadController.update);

  };
};
