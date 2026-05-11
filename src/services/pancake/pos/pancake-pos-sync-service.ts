import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import PancakePosClient, { CreateOrderPayload } from "services/pancake/pos/pancake-pos-client";
import { ResolvedLead, HaravanOrderPayload } from "services/pancake/pos/types";
import {
  HARAVAN_FINANCIAL_STATUS,
  HARAVAN_FULFILLMENT_STATUS,
  HARAVAN_TOPIC
} from "services/ecommerce/enum";

const POS_STATUS = {
  NEW: 0,
  WAITING_FOR_CONFIRMATION: 17,
  CONFIRMED: 1,
  PACKAGING: 8,
  WAITING_FOR_PICKUP: 9,
  WAIT_FOR_PRINTING: 12,
  PRINTED: 13,
  SHIPPED: 2,
  RECEIVED: 3,
  COLLECTED_MONEY: 16,
  RETURNING: 4,
  PARTIAL_RETURN: 15,
  RETURNED: 5,
  RESTOCKING: 11,
  CANCELED: 6,
  DELETED: 7,
  PURCHASED: 20
} as const;

export default class PancakePOSSyncService {
  private db: ReturnType<typeof Database.instance>;
  private client: PancakePosClient;

  constructor(env: any) {
    this.db = Database.instance(env);
    this.client = new PancakePosClient(env.PANCAKE_POS_API_KEY);
  }

  static async dequeueOrderQueue(batch: any, env: any): Promise<void> {
    const service = new PancakePOSSyncService(env);
    for (const msg of batch.messages) {
      try {
        await service.processOrder(msg.body);
        msg.ack();
      } catch (error) {
        Sentry.captureException(error, { tags: { service: "PancakePOSSyncService" } });
        msg.retry();
      }
    }
  }

  async processOrder(order: HaravanOrderPayload): Promise<void> {
    if (!order.customer_phone) return;

    const lead = await this.resolveAdsId(order.customer_phone);
    if (!lead) return;

    const shopId = await this.resolveShopId(lead.pageId);
    if (!shopId) {
      console.warn(`[PancakePOSSync] No pos_shop_id for page ${lead.pageId}, skipping order ${order.id}`);
      return;
    }

    if (order.haravan_topic === HARAVAN_TOPIC.CREATED) {
      await this.syncOrderCreate(order, shopId, lead);
    } else if (order.haravan_topic === HARAVAN_TOPIC.UPDATED) {
      await this.syncOrderUpdate(order, shopId);
    }
  }

  private async resolveAdsId(customerPhone: string): Promise<ResolvedLead | null> {
    const pageCustomer = await this.db.page_customer.findFirst({
      where: { phone: customerPhone },
      select: { customer_id: true }
    });
    if (!pageCustomer?.customer_id) return null;

    const conversation = await this.db.conversation.findFirst({
      where: {
        customer_id: pageCustomer.customer_id,
        type: "INBOX",
        NOT: { ad_ids: null }
      },
      orderBy: { updated_at: "desc" },
      select: { id: true, page_id: true, ad_ids: true }
    });
    if (!conversation) return null;

    const adIds: string[] = Array.isArray(conversation.ad_ids)
      ? (conversation.ad_ids as string[]).filter(Boolean)
      : [];
    if (adIds.length === 0) return null;

    return {
      conversationId: conversation.id ?? "",
      pageId: conversation.page_id ?? "",
      adIds
    };
  }

  private async resolveShopId(pageId: string): Promise<number | null> {
    const page = await this.db.page.findFirst({
      where: { id: pageId },
      select: { pos_shop_id: true }
    });
    return page?.pos_shop_id ?? null;
  }

  private mapStatus(financialStatus: string, fulfillmentStatus: string | null): number {
    const normalizedFinancialStatus = financialStatus?.toLowerCase();
    const normalizedFulfillmentStatus = fulfillmentStatus?.toLowerCase() ?? null;

    if (normalizedFinancialStatus === HARAVAN_FINANCIAL_STATUS.VOIDED) return POS_STATUS.CANCELED;
    if (normalizedFinancialStatus === HARAVAN_FINANCIAL_STATUS.REFUNDED) return POS_STATUS.RETURNED;
    if (normalizedFinancialStatus === HARAVAN_FINANCIAL_STATUS.PARTIALLY_REFUNDED) return POS_STATUS.PARTIAL_RETURN;

    if (normalizedFinancialStatus === HARAVAN_FINANCIAL_STATUS.PAID) {
      if (normalizedFulfillmentStatus === HARAVAN_FULFILLMENT_STATUS.SHIPPED) return POS_STATUS.RECEIVED;
      if (normalizedFulfillmentStatus === HARAVAN_FULFILLMENT_STATUS.PARTIAL) return POS_STATUS.SHIPPED;
      return POS_STATUS.PACKAGING;
    }

    if (normalizedFinancialStatus === HARAVAN_FINANCIAL_STATUS.PARTIALLY_PAID) {
      return POS_STATUS.CONFIRMED;
    }

    // pending
    return POS_STATUS.WAITING_FOR_CONFIRMATION;
  }

  private buildCreatePayload(order: HaravanOrderPayload, lead: ResolvedLead, status: number): CreateOrderPayload {
    const fullName = [order.customer_first_name, order.customer_last_name].filter(Boolean).join(" ") || undefined;
    const shippingFee = (order.shipping_lines ?? []).reduce(
      (total, line) => total + (parseFloat(String(line.price ?? 0)) || 0),
      0
    );

    return {
      bill_full_name: fullName,
      bill_phone_number: order.customer_phone ?? undefined,
      note: order.name,
      status,
      total_discount: parseFloat(order.total_discounts) || 0,
      shipping_fee: shippingFee,
      ad_id: lead.adIds[0],
      page_id: lead.pageId,
      conversation_id: lead.conversationId
    };
  }

  private async syncOrderCreate(order: HaravanOrderPayload, shopId: number, lead: ResolvedLead): Promise<void> {
    const existing = await this.db.pancake_pos_order_sync.findUnique({
      where: { haravan_order_id: BigInt(order.id) }
    });
    if (existing?.pancake_order_id) return;

    const status = this.mapStatus(order.financial_status, order.fulfillment_status);
    const payload = this.buildCreatePayload(order, lead, status);
    const posOrder = await this.client.createOrder(shopId, payload);

    await this.db.pancake_pos_order_sync.upsert({
      where: { haravan_order_id: BigInt(order.id) },
      create: {
        haravan_order_id: BigInt(order.id),
        pancake_order_id: posOrder.id,
        shop_id: shopId,
        ads_id: lead.adIds[0],
        status,
        synced_at: new Date()
      },
      update: {
        pancake_order_id: posOrder.id,
        shop_id: shopId,
        ads_id: lead.adIds[0],
        status,
        synced_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  private async syncOrderUpdate(order: HaravanOrderPayload, shopId: number): Promise<void> {
    const sync = await this.db.pancake_pos_order_sync.findUnique({
      where: { haravan_order_id: BigInt(order.id) }
    });
    if (!sync?.pancake_order_id) return;

    const status = this.mapStatus(order.financial_status, order.fulfillment_status);
    if (sync.status === status) return;

    await this.client.updateOrderStatus(sync.shop_id ?? shopId, sync.pancake_order_id, status);
    await this.db.pancake_pos_order_sync.update({
      where: { haravan_order_id: BigInt(order.id) },
      data: { status, updated_at: new Date() }
    });
  }
}
