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
  }

  async sendOrderNotification(orderData) {
    if (this.shouldSkipOrder(orderData)) {
      return;
    }

    const message = this.buildOrderMessage(orderData);
    const larkClient = await LarksuiteService.createClientV2(this.env);
    await larkClient.im.message.create({
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
    const products = orderData.line_items.map(item => item.title);

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
    if (!OrderNotificationService.WHITELIST_SOURCES.includes(orderData.source)) {
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
      const orderData = message.body;
      if (await orderNotificationService.shouldSkipMessage(orderData)) continue;
      await this.sendOrderNotification(orderData);
      await orderNotificationService.markOrderNotified(orderData);
    }
  }

  async shouldSkipMessage(orderData) {
    if (orderData.haravan_topic !== HARAVAN_TOPIC.CREATED) {
      return true;
    }

    if (await this.notifiedBefore(orderData)) {
      return true;
    }
  }

  buildDedupKey(orderData) {
    return `order_notif:${orderData.id}`;
  }

  async notifiedBefore(orderData) {
    const kv = this.env.FN_KV;
    const dedupKey = this.buildDedupKey(orderData);
    const sent = await kv.get(dedupKey);
    return !!sent;
  }

  async markOrderNotified(orderData) {
    const kv = this.env.FN_KV;
    const dedupKey = this.buildDedupKey(orderData);
    await kv.put(dedupKey, "1", { expirationTtl: 86400 });
  }
}
