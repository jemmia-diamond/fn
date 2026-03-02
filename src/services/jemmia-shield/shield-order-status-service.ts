import * as Sentry from "@sentry/cloudflare";
import Database from "src/services/database";
import JemmiaShieldLarkService from "src/services/jemmia-shield/jemmia-shield-lark-service";
import { JEMMIA_SHIELD_MESSAGE_TYPE } from "src/constants/jemmia-shield-constants";
import { getFinancialStatus } from "src/services/haravan/orders/order-service/helpers/financial-status";
import { getFulfillmentStatus } from "src/services/haravan/orders/order-service/helpers/fulfillment-status";

export class ShieldOrderStatusService {
  static async sendOrderStatusNotification(env, orderData) {
    const statusChanged = await this.hasStatusChanged(env, orderData);
    if (!statusChanged) {
      return;
    }

    await this.handleStatusNotification(env, orderData);
  }

  static async hasStatusChanged(env, orderData) {
    const db = Database.instance(env);
    const orderId = orderData?.order?.id;
    if (orderId === null) return false;

    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      select: {
        financial_status: true,
        fulfillment_status: true
      }
    });

    return (
      !existingOrder ||
      existingOrder.financial_status !== orderData.financial_status ||
      existingOrder.fulfillment_status !== orderData.fulfillment_status
    );
  }

  static async handleStatusNotification(env, orderData) {
    const orderId = orderData?.order?.id;
    if (orderId === null) return;

    const orderName = orderData?.order?.name;
    if (!orderName || !orderData?.order) return;
    const financialStatus = orderData.order.financial_status;
    const fulfillmentStatus = orderData.order.fulfillment_status;

    const messageIds = await this.findMentionedThreads(env, orderId, orderName);

    if (messageIds.length > 0) {
      await this.sendStatusToThreads(
        env,
        messageIds,
        orderName,
        financialStatus,
        fulfillmentStatus
      );
    }
  }

  static async dequeueOrderStatusQueue(batch, env) {
    for (const message of batch.messages) {
      await this.sendOrderStatusNotification(env, message.body).catch(
        Sentry.captureException
      );
    }
  }

  static async findMentionedThreads(
    env: any,
    orderId: string | number,
    orderName: string
  ): Promise<string[]> {
    const db = Database.instance(env);

    const mappings = await (db as any).crm_lark_message.findMany({
      where: {
        OR: [
          { order_name: orderName },
          { order_id: orderId ? BigInt(orderId) : undefined }
        ]
      },
      select: { lark_message_id: true }
    });

    if (!mappings || mappings.length === 0) return [];

    const messageIds = mappings
      .map((m: any) => m.lark_message_id)
      .filter((id: string | null) => !!id);

    return Array.from(new Set(messageIds)) as string[];
  }

  static async sendStatusToThreads(
    env: any,
    messageIds: string[],
    orderCode: string,
    financialStatus: string,
    fulfillmentStatus: string
  ): Promise<void> {
    if (!messageIds || messageIds.length === 0) return;

    const cardContent = this.buildStatusUpdateCard(
      orderCode,
      financialStatus,
      fulfillmentStatus
    );

    await Promise.allSettled(
      messageIds.map((msgId) =>
        JemmiaShieldLarkService.sendMessageToThread(
          env,
          msgId,
          JEMMIA_SHIELD_MESSAGE_TYPE.INTERACTIVE,
          cardContent
        )
      )
    );
  }

  private static buildStatusUpdateCard(
    orderCode: string,
    financialStatus: string,
    fulfillmentStatus: string
  ): string {
    const header = {
      tag: "div",
      text: {
        tag: "lark_md",
        content: `📦 **Thông tin đơn hàng ${orderCode}**`
      }
    };

    const financialStatusText = getFinancialStatus(financialStatus);
    const fulfillmentStatusText = getFulfillmentStatus(fulfillmentStatus);

    const statusElements = {
      tag: "div",
      text: {
        tag: "lark_md",
        content: `Trạng thái thanh toán đã được cập nhật: **${financialStatusText}**\nTrạng thái giao hàng đã được cập nhật: **${fulfillmentStatusText}**`
      }
    };

    return JSON.stringify({ elements: [header, statusElements] });
  }
}
