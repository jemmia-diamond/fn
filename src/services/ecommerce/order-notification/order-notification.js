import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";

export default class OrderNotificationService {

  constructor(env) {
    this.env = env;
    this.larkClient = LarksuiteService.createClient(env);
  }

  async sendOrderNotification(orderData) {
    if (orderData.source !== "web") {
      return;
    }

    const customerData = orderData.customer;
    if (customerData.first_name.includes("test") || customerData.last_name.includes("test")) {
      return;
    }

    const products = orderData.line_items.map((item) => {
      return `${item.quantity} x ${item.name} - ${item.price}`;
    });
    const message = `
      [🔥NEW ORDER FROM WEB🔥]

      Order number: ${orderData.order_number}
      Product: ${products.join(", ")}
      Total price: ${orderData.total_price}
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
