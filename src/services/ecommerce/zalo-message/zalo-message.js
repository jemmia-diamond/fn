import ZNSMessageService from "services/zalo-message/zalo-message";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";
import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import HaravanAPIClient from "services/haravan/api-client/api-client";
import { getLatestOrderId } from "services/ecommerce/order-tracking/queries/get-latest-orderid";
import Database from "services/database";
import crypto from "crypto";

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
        continue;
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

        const isOrderInDelivery = await this.checkOrderInDelivery(String(order.id), db);
        if (isOrderInDelivery) {
          continue;
        }

        const madeOrderInDelivery = await this.makeOrderInDelivery(String(order.id), db);
        if (!madeOrderInDelivery) {
          continue;
        }

        const templateId = ZALO_TEMPLATE.delivering;

        const bearerToken = await env.BEARER_TOKEN_SECRET.get();
        const hashedToken =  this.createHashForOrderTracking({ order_id: order.id }, bearerToken);
        const extraParams = {
          trackingRedirectPath: `order-tracking?order_id=${order.id}&token=${hashedToken}`
        };

        const result = GetTemplateZalo.getTemplateZalo(templateId, order, extraParams);
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
      return orderInDelivery.length > 0;
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

        const order = getOrderResponse.data.order;

        if (!order) {
          continue;
        }

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

  static createHashForOrderTracking(payloadObject, secret) {
    const hashPayload = JSON.stringify(payloadObject);
    const hashData = `${hashPayload}`;
    const hashedToken =  this.generateHash(hashData, secret);
    return hashedToken;
  }

  static generateHash(data, secret) {
    return crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");
  }
}
