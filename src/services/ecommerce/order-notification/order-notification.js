import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";

export default class OrderNotificationService {

  constructor(env) {
    this.env = env;
    this.larkClient = LarksuiteService.createClient(env);
  }

  async sendOrderNotification(orderData) {
    const source = orderData.source;
    if (source === "web") {

      const message = `
      New order from web: ${orderData.order_number}
      `.trim();

      await this.larkClient.im.message.create({
        params: {
          receive_id_type: "chat_id"
        },
        data: {
          receive_id: CHAT_GROUPS.ECOM_ORDER_NOTIFICATION.chat_id,
          msg_type: "text",
          content: JSON.stringify({
            text: message
          })
        }
      });
    }
  }

  static async orderNotificationDequeue(batch, env) {
    const orderNotificationService = new OrderNotificationService(env);

    for (const message of batch.messages) {
      try {
        const orderData = message.body;
        if (orderData.haravan_topic === HARAVAN_TOPIC.CREATED) {
          await orderNotificationService.sendOrderNotification(orderData);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
