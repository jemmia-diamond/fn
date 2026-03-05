import DeploymentNotificationController from "controllers/webhook/notification/depoyment-notification-controller";

export default class DeploymentNotificationWebhook {
  static async register(webhook: any) {
    const deploymentNotificationWebhookNamespace = webhook.basePath("/notification");
    deploymentNotificationWebhookNamespace.post("/deployment", DeploymentNotificationController.create);
  }
}
