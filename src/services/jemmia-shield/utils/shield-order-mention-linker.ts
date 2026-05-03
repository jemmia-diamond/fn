import Database from "src/services/database";
import FrappeClient from "src/frappe/frappe-client";
import { getSalesOrdersByHaravanOrderId } from "src/services/erp/selling/sales-order/utils/sales-order-helpers";
import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import {
  JEMMIA_SHIELD_MESSAGE_TYPE,
  JEMMIA_SHIELD_CONTENT_TAG,
  ORDER_REGEX
} from "src/constants/jemmia-shield-constants";
import { ShieldOrderLinkInfo } from "services/jemmia-shield/interfaces/shield-interface";
import dayjs from "dayjs";
import { getFinancialStatus } from "src/services/haravan/orders/order-service/helpers/financial-status";
import { getFulfillmentStatus } from "src/services/haravan/orders/order-service/helpers/fulfillment-status";

export class ShieldOrderMentionLinker {
  /**
   * Detect order codes in message (TEXT or POST) and reply order info card to thread.
   */
  static async replyOrderLinksIfMentioned(env: any, event: any): Promise<void> {
    const messageText = this.extractTextFromMessage(event);
    const orderCodes = this.extractOrderCodes(messageText);
    if (orderCodes.length === 0) return;

    const frappeClient = this.createFrappeClient(env);
    const orderLinks = await this.fetchOrderLinks(frappeClient, orderCodes);

    if (orderLinks.length === 0) return;

    await this.sendOrderInfoCard(env, event, orderLinks);
  }

  static async saveOrderMappingsIfMentioned(env: any, event: any): Promise<void> {
    const messageText = this.extractTextFromMessage(event);
    const orderCodes = this.extractOrderCodes(messageText);
    if (orderCodes.length === 0) return;

    const frappeClient = this.createFrappeClient(env);
    const orderLinks = await this.fetchOrderLinks(frappeClient, orderCodes);
    if (orderLinks.length === 0) return;

    const messageId = event.message.message_id;
    await this.saveOrderMappings(env, messageId, orderLinks);
  }

  private static async saveOrderMappings(
    env: any,
    messageId: string,
    orderLinks: ShieldOrderLinkInfo[]
  ): Promise<void> {
    const db = Database.instance(env);

    const data = orderLinks.map((link) => ({
      id: crypto.randomUUID(),
      lark_message_id: messageId,
      order_name: link.orderCode,
      order_id: link.erpName ? BigInt(link.erpName.replace(/\D/g, "")) : null
    }));

    await (db as any).crm_lark_message.createMany({
      data,
      skipDuplicates: true
    });
  }

  private static extractTextFromMessage(event: any): string {
    const content = JSON.parse(event.message.content);
    const messageType = event.message.message_type;

    if (messageType === JEMMIA_SHIELD_MESSAGE_TYPE.TEXT) {
      return content.text || "";
    }

    if (messageType === JEMMIA_SHIELD_MESSAGE_TYPE.POST) {
      return this.extractTextFromPostContent(content);
    }

    return "";
  }

  private static extractTextFromPostContent(content: any): string {
    if (!content?.content || !Array.isArray(content.content)) return "";

    const texts: string[] = [];
    if (content.title) texts.push(content.title);

    for (const lines of content.content) {
      if (!Array.isArray(lines)) continue;
      for (const item of lines) {
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.TEXT && item.text) {
          texts.push(item.text);
        }
      }
    }

    return texts.join(" ");
  }

  private static extractOrderCodes(text: string): string[] {
    if (!text) return [];
    const matches = text.match(ORDER_REGEX);
    if (!matches) return [];
    return Array.from(new Set(matches));
  }

  public static createFrappeClient(env: any) {
    return FrappeClient.instance(env);
  }

  public static async fetchOrderLinks(
    frappeClient: any,
    orderCodes: string[]
  ): Promise<ShieldOrderLinkInfo[]> {
    const results: ShieldOrderLinkInfo[] = [];

    for (const code of orderCodes) {
      const linkInfo = await this.fetchSingleOrderLink(frappeClient, code);
      if (linkInfo) results.push(linkInfo);
    }

    return results;
  }

  private static async fetchSingleOrderLink(
    frappeClient: any,
    orderCode: string
  ): Promise<ShieldOrderLinkInfo | null> {
    try {
      const orders = await getSalesOrdersByHaravanOrderId(
        frappeClient,
        orderCode,
        [
          "name",
          "haravan_order_id",
          "split_order_group",
          "grand_total",
          "transaction_date",
          "financial_status",
          "fulfillment_status",
          "cancelled_status",
          "status"
        ]
      );
      if (!orders || orders.length === 0) return null;

      const order = orders[0];
      const haravanIdOnly = orderCode.replace("ORDER", "");
      return {
        orderCode,
        erpName: order.name,
        haravanId: order.split_order_group || haravanIdOnly,
        total: order.grand_total,
        orderDate: order.transaction_date,
        paymentStatus: order.financial_status,
        deliveryStatus: order.fulfillment_status,
        status: order.status,
        cancelledStatus: order.cancelled_status
      };
    } catch {
      return null;
    }
  }

  private static async buildSingleOrderCardElements(
    env: any,
    link: ShieldOrderLinkInfo
  ): Promise<any[]> {
    const db = Database.instance(env);
    const orderNumber = link.orderCode.replace("ORDER", "");

    const order = await db.order.findFirst({
      where: {
        order_number: `ORDER${orderNumber}`
      }
    });

    const total = order ? Number(order.total_price) : link.total;
    const orderDate = order ? order.created_at : link.orderDate;
    const paymentStatus = order ? order.financial_status : link.paymentStatus;
    const deliveryStatus = order ? order.fulfillment_status : link.deliveryStatus;
    const cancelledStatus = order ? order.cancelled_status : link.cancelledStatus;

    const formattedTotal = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(total);

    const formattedDate = dayjs(orderDate).format("DD/MM/YYYY HH:mm");
    const paymentStatusText = getFinancialStatus(paymentStatus);
    const deliveryStatusText = getFulfillmentStatus(deliveryStatus);

    const header = {
      tag: "div",
      text: {
        tag: "lark_md",
        content: `**📦 Thông tin đơn hàng: ${link.orderCode}**`
      }
    };

    const details: string[] = [
      `💰 **Tổng giá trị:** ${formattedTotal}`,
      `📅 **Ngày đặt hàng:** ${formattedDate}`,
      `💳 **Thanh toán:** ${paymentStatusText}`,
      `🚚 **Giao hàng:** ${deliveryStatusText}`
    ];

    if (String(cancelledStatus).toLowerCase() === "cancelled") {
      details.push("🚫 **Trạng thái huỷ:** Đã huỷ");
    }

    const contentElement = {
      tag: "div",
      text: {
        tag: "lark_md",
        content: details.join("\n")
      }
    };

    const actionButtons = this.buildActionButtons(env, link);

    return [header, contentElement, actionButtons];
  }

  private static buildActionButtons(
    env: any,
    linkInfo: ShieldOrderLinkInfo
  ): any {
    const erpBaseUrl = `${env.JEMMIA_ERP_BASE_URL}/app/sales-order`;
    const haravanBaseUrl = `${env.HARAVAN_APP_URL}/admin/orders`;

    return {
      tag: "action",
      actions: [
        {
          tag: "button",
          text: {
            tag: "plain_text",
            content: "Xem trên ERP"
          },
          url: `${erpBaseUrl}/${linkInfo.erpName}`,
          type: "default"
        },
        {
          tag: "button",
          text: {
            tag: "plain_text",
            content: "Xem trên Haravan"
          },
          url: `${haravanBaseUrl}/${linkInfo.haravanId}`,
          type: "default"
        }
      ]
    };
  }

  private static async sendOrderInfoCard(
    env: any,
    event: any,
    orderLinks: ShieldOrderLinkInfo[]
  ): Promise<void> {
    const threadId = event.message.root_id ?? event.message.message_id;

    for (const link of orderLinks) {
      const elements = await this.buildSingleOrderCardElements(env, link);
      const cardContent = JSON.stringify({ elements });

      await JemmiaShieldLarkService.sendMessageToThread(
        env,
        threadId,
        JEMMIA_SHIELD_MESSAGE_TYPE.INTERACTIVE,
        cardContent
      );
    }
  }
}
