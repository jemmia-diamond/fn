import AIHubERPUpdateLeadController from "controllers/webhook/ai-hub/erp/update-lead";

export default class AIHubWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  aiHubWebhookNamespace = webhook.basePath("/ai-hub");

    // aiHubWebhookNamespace.use("*", verifyAIHubWebhook);
    aiHubWebhookNamespace.post("erp/leads", AIHubERPUpdateLeadController.create);

  };
};
