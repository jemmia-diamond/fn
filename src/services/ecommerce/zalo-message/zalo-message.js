import ZNSMessageService from "services/zalo-message/zalo-message";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";
import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import HaravanAPIClient from "services/haravan/api-client/api-client";
import { getLatestOrderId } from "services/ecommerce/order-tracking/queries/get-latest-orderid";
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
   * This function processes a batch of messages from the queue and sends Zalo reminders for payment.
   * @param {*} batch
   * @param {*} env
   */
  static async dequeueSendZaloRemindPayMessageQueue(batch, env) {
    const messages = batch.messages;
    for (const message of messages) {

      try {
        const payload = message.body;
        const orderData = payload.data;
        const dispatchType = payload.dispatchType; // 'DELAYED'

        if (dispatchType !== "DELAYED") {
          continue;
        }

        const db = Database.instance(env);

        const latestOrderId = await getLatestOrderId(db, orderData.id);

        // Get latest order data from Haravan API
        const haravanApiClient = new HaravanAPIClient(env);
        const getOrderResponse = await haravanApiClient.orders.order.getOrder(latestOrderId);
        if (!getOrderResponse || !getOrderResponse.data) {
          continue;
        }

        const order = getOrderResponse.data;

        if (!this.eligibleForSendingZaloMessage(order)) {
          continue;
        }

        // Ignore if order is cancelled
        if (order.cancelled_status === "cancelled") {
          continue;
        }

        // Ignore if order is re-ordered to another order
        if (order.ref_order_number) {
          continue;
        }

        // Ignore if order is already paid or partially paid
        if (order.financial_status === "paid" || order.financial_status === "partially_paid") {
          continue;
        }

        const templateId = ZALO_TEMPLATE.remindPay;
        const result = GetTemplateZalo.getTemplateZalo(templateId, order);
        if (result) {
          await this.sendZaloMessage(result.phone, templateId, result.templateData, env);
        }
      } catch (error) {
        console.error("Failed to process order for Zalo remind pay message:", error);
      }
    }
  }
}
