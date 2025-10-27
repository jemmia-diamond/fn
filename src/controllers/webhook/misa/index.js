import CallbackResultsController from "controllers/webhook/misa/callback/callback-results-controller";

export default class MisaWebhook {
  static async register(webhook) {
    const misaWebhookNamespace = webhook.basePath("/misa");
    misaWebhookNamespace.post("/callback_results", CallbackResultsController.create);
  }
}
