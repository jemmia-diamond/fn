import ERPNotificationController from "controllers/webhook/notification/notification-controller";

export default class DeploymentNotificationWebhook {
  static async register(webhook: any) {
    const deploymentNotificationWebhookNamespace = webhook.basePath("/notification");
    deploymentNotificationWebhookNamespace.post("/deployment", ERPNotificationController.create);
  }
}
