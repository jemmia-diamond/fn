import NotificationService from "src/services/erp-notification-service";

export default class ERPNotificationController {
  static async create(c: any) {
    const payload = await c.req.json();
    const options = NotificationService.getQueueOptions(payload.event);

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
