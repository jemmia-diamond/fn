import DeploymentNotificationService from "services/deployment-notification-service";

export default class DeploymentNotificationController {
  static async create(c: any) {
    const payload = await c.req.json();
    const options = DeploymentNotificationService.getQueueOptions(payload.event);

    if (options) {
      await c.env.NOTIFICATION_QUEUE.send({
        ...payload,
        chatId: options.chatId
      }, {
        delaySeconds: options.delaySeconds
      });
    }

    return c.json({ success: true });
  }
}
