import * as Sentry from "@sentry/cloudflare";
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";
import { stringSquish } from "services/utils/string-helper";
import { numberToCurrency } from "services/utils/number-helper";
import { isTestOrder, isReorder } from "services/utils/order-intercepter";

export default class OrderNotificationService {
  static WHITELIST_SOURCES = ["web"];

  constructor(env) {
    this.env = env;
    this.larkClient = LarksuiteService.createClient(env);
  }

  async sendOrderNotification(orderData) {
    if (this.shouldSkipOrder(orderData)) {
      return;
    }

    const message = this.buildOrderMessage(orderData);
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

  buildOrderMessage(orderData) {
    const products = orderData.line_items.map((item) => item.title);

    return stringSquish(`
      [🔥NEW ORDER FROM WEB🔥]

      Order number: ${orderData.order_number}
      Product: ${products.join(", ")}
      Customer: ${orderData.billing_address.name}
      Total price: ${numberToCurrency(orderData.total_price)}

      Link: https://jemmia.vn/admin/orders/${orderData.id}
    `);
  }

  shouldSkipOrder(orderData) {
    if (
      !OrderNotificationService.WHITELIST_SOURCES.includes(orderData.source)
    ) {
      return true;
    }

    if (isTestOrder(orderData)) {
      return true;
    }

    if (isReorder(orderData)) {
      return true;
    }

    return false;
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
        Sentry.captureException(error);
      }
    }
  }
}
