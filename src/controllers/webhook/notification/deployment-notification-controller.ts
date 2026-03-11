import DeploymentNotificationService from "services/deployment-notification-service";

export default class DeploymentNotificationController {
  static async create(c: any) {
    const payload = await c.req.json();
    const source = payload.source;
    const options = DeploymentNotificationService.getQueueOptions(payload.event, source);

    if (options) {
      await c.env.NOTIFICATION_QUEUE.send({
        ...payload,
        source,
        chatId: options.chatId
      }, {
        delaySeconds: options.delaySeconds
      });
    }

    return c.json({ success: true });
  }
}
