import FrappeClient from "src/frappe/frappe-client";
import { getSalesOrdersByHaravanOrderId } from "src/services/erp/selling/sales-order/utils/sales-order-helpers";
import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import {
  JEMMIA_SHIELD_MESSAGE_TYPE,
  JEMMIA_SHIELD_CONTENT_TAG,
  ORDER_REGEX
} from "src/constants/jemmia-shield-constants";
import { ShieldOrderLinkInfo } from "services/jemmia-shield/interfaces/shield-interface";

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

    for (const line of content.content) {
      if (!Array.isArray(line)) continue;
      for (const item of line) {
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

  private static createFrappeClient(env: any) {
    return new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
  }

  private static async fetchOrderLinks(
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
        orderCode
      );
      if (!orders || orders.length === 0) return null;

      const order = orders[0];
      const haravanIdOnly = orderCode.replace("ORDER", "");
      return {
        orderCode,
        erpName: order.name,
        haravanId: order.split_order_group || haravanIdOnly
      };
    } catch (error) {
      console.warn(
        `[ShieldOrderMentionLinker] Error fetching order ${orderCode}:`,
        error
      );
      return null;
    }
  }

  private static buildOrderCardElements(
    env: any,
    orderLinks: ShieldOrderLinkInfo[]
  ): any[] {
    const erpBaseUrl = `${env.ERP_APP_URL}/app/sales-order`;
    const haravanBaseUrl = `${env.HARAVAN_APP_URL}/admin/orders`;

    const header = {
      tag: "div",
      text: {
        tag: "lark_md",
        content: "**📦 Thông tin đơn hàng:**"
      }
    };

    const linkElements = orderLinks.map((link) => ({
      tag: "div",
      text: {
        tag: "lark_md",
        content: `**${link.orderCode}:** [ERP](${erpBaseUrl}/${link.erpName}) | [Haravan](${haravanBaseUrl}/${link.haravanId})`
      }
    }));

    return [header, ...linkElements];
  }

  private static async sendOrderInfoCard(
    env: any,
    event: any,
    orderLinks: ShieldOrderLinkInfo[]
  ): Promise<void> {
    const elements = this.buildOrderCardElements(env, orderLinks);
    const threadId = event.message.root_id ?? event.message.message_id;
    const cardContent = JSON.stringify({ elements });

    await JemmiaShieldLarkService.sendMessageToThread(
      env,
      threadId,
      JEMMIA_SHIELD_MESSAGE_TYPE.INTERACTIVE,
      cardContent
    );
  }
}
