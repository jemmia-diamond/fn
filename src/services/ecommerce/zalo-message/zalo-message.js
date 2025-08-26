import ZNSMessageService from "services/zalo-message/zalo-message";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";
import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import Database from "services/database";

export default class SendZaloMessage {
  constructor(env) {
    this.env = env;
  }
  static whitelistPhones = ["0862098011", "0829976232"];
  static whitelistSource = "web";

  static async sendZaloMessage(phone, templateId, templateData, env) {
    try {
      const messageService = new ZNSMessageService(env);
      return await messageService.sendMessage(phone, templateId, templateData);
    } catch (error) {
      console.error("Error sending Zalo message:", error);
      throw new Error("Failed to send Zalo message");
    }
  }

  static eligibleForSendingZaloMessage(message) {
    if (this.whitelistSource.includes(message?.source)
        && this.whitelistPhones.includes(message?.billing_address?.phone)
        && message.ref_order_id === 0) {
      return true;
    }

    return false;
  }

  static async dequeueSendZaloMessageQueue(batch, env) {
    const messages = batch.messages;
    for (const message of messages) {
      if (!this.eligibleForSendingZaloMessage(message.body)) {
        return;
      }

      const templateId = ZALO_TEMPLATE.orderConfirmed;
      const result = GetTemplateZalo.getTemplateZalo(templateId, message.body);
      if (result) {
        await this.sendZaloMessage(result.phone, templateId, result.templateData, env);
      }
    }
  }

  /**
   * This function processes an order and sends a Zalo message when the order starts delivery.
   * @param {*} batch
   * @param {*} env
   */
  static async dequeueSendZaloDeliveryMessageQueue(batch, env) {
    const messages = batch.messages;
    for (const message of messages) {
      try {

        const order = message.body;

        if (!this.eligibleForSendingZaloMessage(order)) {
          continue;
        }

        const haravanFulfillment = this.getLatestFulfillment(order);

        if (!haravanFulfillment || !haravanFulfillment.delivering_date) {
          continue;
        }

        const db = Database.instance(env);

        const isOrderInDelivery = await this.checkOrderInDelivery(order.id, db);
        if (isOrderInDelivery) {
          continue;
        }

        const madeOrderInDelivery = await this.makeOrderInDelivery(order.id, db);
        if (!madeOrderInDelivery) {
          continue;
        }

        const templateId = ZALO_TEMPLATE.delivering;
        const result = GetTemplateZalo.getTemplateZalo(templateId, order);
        if (result) {
          await this.sendZaloMessage(result.phone, templateId, result.templateData, env);
        }
      } catch (error) {
        console.error("Failed to process order for Zalo delivery message:", error);
      }
    }
  }

  static getLatestFulfillment(order) {
    return order.fulfillments?.[order.fulfillments.length - 1] || {};
  }

  static async checkOrderInDelivery(orderId, db) {
    try {
      const orderInDelivery = await db.$queryRaw`
        SELECT 1 FROM ecommerce.order_tracking
        WHERE haravan_order_id = ${orderId} AND haravan_order_status = 'delivering'
      `;
      return orderInDelivery.count > 0;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async makeOrderInDelivery(orderId, db) {
    const uuid = crypto.randomUUID();
    try {
      await db.$queryRaw`
        INSERT INTO ecommerce.order_tracking (uuid, haravan_order_id, haravan_order_status)
        VALUES (${uuid}, ${orderId}, 'delivering')
        ON CONFLICT (haravan_order_id, haravan_order_status) DO NOTHING;
      `;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
