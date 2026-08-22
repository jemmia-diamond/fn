import { verifyStaticTokenAuth } from "auth/static-token-auth";
import AIHubERPUpdateLeadController from "controllers/webhook/ai-hub/erp/update-lead";

export default class AIHubWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  aiHubWebhookNamespace = webhook.basePath("/ai-hub");

    aiHubWebhookNamespace.use("*", verifyStaticTokenAuth("X-AIHUB-Delivery", "BEARER_TOKEN"));
    aiHubWebhookNamespace.post("erp/leads", AIHubERPUpdateLeadController.create);

  };
};
