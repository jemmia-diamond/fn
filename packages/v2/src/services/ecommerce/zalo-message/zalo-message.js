import ZNSMessageService from "services/zalo-message/zalo-message";
import { GetTemplateZalo } from "services/ecommerce/zalo-message/utils/format-template-zalo";
import { ZALO_TEMPLATE } from "services/ecommerce/zalo-message/enums/zalo-template.enum";
import HaravanAPIClient from "services/haravan/api-client/api-client";
import { getLatestOrderId } from "services/ecommerce/order-tracking/queries/get-latest-orderid";
import Database from "services/database";
import crypto from "crypto";
import { getInitialOrder } from "services/ecommerce/order-tracking/queries/get-initial-order";
import { HARAVAN_DISPATCH_TYPE_ZALO_MSG } from "services/ecommerce/enum";

export default class SendZaloMessage {
  constructor(env) {
    this.env = env;
  }
  static whitelistSource = ["web"];

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
    if (
      this.whitelistSource.includes(message?.source) &&
      message.ref_order_id === 0
    ) {
      return true;
    }

    return false;
  }

  static async dequeueSendZaloConfirmMessageQueue(batch, env) {
    const messages = batch.messages;
    for (const message of messages) {
      const order = message.body;
      if (!this.eligibleForSendingZaloMessage(order)) {
        continue;
      }

      if (order.dispatchType !== HARAVAN_DISPATCH_TYPE_ZALO_MSG.PAID) {
        continue;
      }

      if (
        order.financial_status !== "paid" &&
        order.financial_status !== "partially_paid"
      ) {
        continue;
      }

      const templateId = ZALO_TEMPLATE.orderConfirmed;
      const result = GetTemplateZalo.getTemplateZalo(templateId, order);
      if (result) {
        await this.sendZaloMessage(
          result.phone,
          templateId,
          result.templateData,
          env,
        );
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

        if (
          order.dispatchType === HARAVAN_DISPATCH_TYPE_ZALO_MSG.REMIND_PAY ||
          order.dispatchType === HARAVAN_DISPATCH_TYPE_ZALO_MSG.PAID
        ) {
          continue;
        }

        const haravanFulfillment = this.getLatestFulfillment(order);

        if (!haravanFulfillment || !haravanFulfillment.delivering_date) {
          console.warn("No delivering date found for order:", order.id);
          continue;
        }

        const db = Database.instance(env, "neon");

        // Retrieve oldest order ID in case the order has been re-ordered
        let firstOrder = {
          id: order.id,
          order_number: order.order_number,
        };
        if (order.ref_order_id) {
          firstOrder = await getInitialOrder(db, order.id);
          if (!firstOrder) {
            console.warn("No initial order found for order:", order.id);
            continue;
          }
        }

        const isOrderInDelivery = await this.checkOrderInDelivery(
          String(firstOrder.id),
          db,
        );
        if (isOrderInDelivery) {
          console.warn("Order is already in delivery:", firstOrder.id);
          continue;
        }

        const templateId = ZALO_TEMPLATE.delivering;

        const bearerToken = await env.BEARER_TOKEN_SECRET.get();
        const accessToken = await this.createTokenForOrderTracking(
          {
            order_id: firstOrder.id,
            order_number: firstOrder.order_number,
          },
          bearerToken,
          env,
        );
        const extraParams = {
          trackingRedirectPath: `order-tracking?order_id=${firstOrder.id}&token=${accessToken}`,
        };

        const result = GetTemplateZalo.getTemplateZalo(
          templateId,
          order,
          extraParams,
        );
        console.warn("Zalo Delivery Template", result);

        if (result) {
          await this.sendZaloMessage(
            result.phone,
            templateId,
            result.templateData,
            env,
          );
          await this.makeOrderInDelivery(String(firstOrder.id), db);
        }
      } catch (error) {
        console.error(
          "Failed to process order for Zalo delivery message:",
          error,
        );
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
        const orderData = message.body;
        const dispatchType = orderData.dispatchType;

        if (dispatchType !== HARAVAN_DISPATCH_TYPE_ZALO_MSG.REMIND_PAY) {
          continue;
        }

        const db = Database.instance(env, "neon");

        const latestOrderId = await getLatestOrderId(db, orderData.id);

        // Get latest order data from Haravan API
        const haravanApiClient = new HaravanAPIClient(env);
        const getOrderResponse =
          await haravanApiClient.orders.order.getOrder(latestOrderId);
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
        if (
          order.financial_status === "paid" ||
          order.financial_status === "partially_paid"
        ) {
          continue;
        }

        const templateId = ZALO_TEMPLATE.remindPay;
        const result = GetTemplateZalo.getTemplateZalo(templateId, order);
        if (result) {
          await this.sendZaloMessage(
            result.phone,
            templateId,
            result.templateData,
            env,
          );
        }
      } catch (error) {
        console.error(
          "Failed to process order for Zalo remind pay message:",
          error,
        );
      }
    }
  }

  static async createTokenForOrderTracking(payloadObject, secret, env) {
    const payloadString = `${payloadObject.order_id}|${payloadObject.order_number}|${JSON.stringify(payloadObject)}`;
    const base64Payload = Buffer.from(payloadString).toString("base64url");
    const hashedToken = this.createHashForOrderTracking(payloadString, secret);

    const uuid = crypto.randomUUID();
    const accessToken = `${base64Payload}.${hashedToken}`;
    await env.FN_KV.put(uuid, accessToken);

    return uuid;
  }

  static createHashForOrderTracking(payloadString, secret) {
    const hashedToken = this.generateHash(payloadString, secret);
    return hashedToken;
  }

  static generateHash(data, secret) {
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
  }
}
