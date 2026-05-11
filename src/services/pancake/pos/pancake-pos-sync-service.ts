import { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import PancakePosClient, { CreateOrderPayload } from "services/pancake/pos/pancake-pos-client";

// Pancake POS order status integers
const POS_STATUS = {
  NEW: 0,
  CONFIRMED: 1,
  RECEIVED: 3,
  RETURNED: 5,
  CANCELED: 6,
  PARTIAL_RETURN: 15,
} as const;

interface ResolvedLead {
  conversationId: string;
  pageId: string;
  adIds: string[];
}

interface HaravanOrderPayload {
  id: number;
  name: string;
  haravan_topic: string;
  financial_status: string;
  fulfillment_status: string | null;
  customer_phone: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  total_shipping_price_set?: { shop_money?: { amount?: string } };
}

export default class PancakePOSSyncService {
  private db: ReturnType<typeof Database.instance>;
  private client: PancakePosClient;

  constructor(env: { PANCAKE_POS_API_KEY: string; HYPERDRIVE: unknown }) {
    this.db = Database.instance(env);
    this.client = new PancakePosClient(env.PANCAKE_POS_API_KEY);
  }

  static async dequeueOrderQueue(batch: { messages: Array<{ body: HaravanOrderPayload; ack: () => void; retry: () => void }> }, env: unknown): Promise<void> {
    const service = new PancakePOSSyncService(env as { PANCAKE_POS_API_KEY: string; HYPERDRIVE: unknown });
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

    if (order.haravan_topic === "orders/create") {
      await this.syncOrderCreate(order, shopId, lead);
    } else if (order.haravan_topic === "orders/updated") {
      await this.syncOrderUpdate(order, shopId);
    }
  }

  private async resolveAdsId(customerPhone: string): Promise<ResolvedLead | null> {
    const rows = await this.db.$queryRaw<Array<{ conversation_id: string; page_id: string; ad_ids: unknown }>>(
      Prisma.sql`
        SELECT c.id AS conversation_id, c.page_id, c.ad_ids
        FROM pancake.conversation c
        JOIN pancake.page_customer pc ON c.customer_id = pc.customer_id
        WHERE pc.phone = ${customerPhone}
          AND c.ad_ids IS NOT NULL
          AND c.type = 'INBOX'
        ORDER BY c.updated_at DESC
        LIMIT 1
      `
    );

    const row = rows[0];
    if (!row) return null;

    const adIds: string[] = Array.isArray(row.ad_ids) ? row.ad_ids.filter(Boolean) : [];
    if (adIds.length === 0) return null;

    return { conversationId: row.conversation_id, pageId: row.page_id, adIds };
  }

  private async resolveShopId(pageId: string): Promise<number | null> {
    const page = await this.db.page.findFirst({
      where: { id: pageId },
      select: { pos_shop_id: true }
    });
    return page?.pos_shop_id ?? null;
  }

  private mapStatus(financialStatus: string, fulfillmentStatus: string | null): number {
    if (financialStatus === "cancelled" || financialStatus === "voided") return POS_STATUS.CANCELED;
    if (financialStatus === "refunded") return POS_STATUS.RETURNED;
    if (financialStatus === "partially_refunded") return POS_STATUS.PARTIAL_RETURN;
    if (financialStatus === "paid") {
      return fulfillmentStatus === "fulfilled" ? POS_STATUS.RECEIVED : POS_STATUS.CONFIRMED;
    }
    return POS_STATUS.NEW;
  }

  private buildCreatePayload(order: HaravanOrderPayload, status: number): CreateOrderPayload {
    const fullName = [order.customer_first_name, order.customer_last_name].filter(Boolean).join(" ") || undefined;
    const shippingFee = parseFloat(order.total_shipping_price_set?.shop_money?.amount ?? "0") || 0;

    return {
      bill_full_name: fullName,
      bill_phone_number: order.customer_phone,
      note: order.name,
      status,
      total_discount: parseFloat(order.total_discounts) || 0,
      shipping_fee: shippingFee,
    };
  }

  private async syncOrderCreate(order: HaravanOrderPayload, shopId: number, lead: ResolvedLead): Promise<void> {
    // Idempotency guard
    const existing = await this.db.pancake_pos_order_sync.findUnique({
      where: { haravan_order_id: BigInt(order.id) }
    });
    if (existing?.pancake_order_id) return;

    const status = this.mapStatus(order.financial_status, order.fulfillment_status);
    const payload = this.buildCreatePayload(order, status);
    const posOrder = await this.client.createOrder(shopId, payload);

    await this.db.pancake_pos_order_sync.upsert({
      where: { haravan_order_id: BigInt(order.id) },
      create: {
        haravan_order_id: BigInt(order.id),
        pancake_order_id: posOrder.id,
        shop_id: shopId,
        ads_id: lead.adIds[0],
        status,
        synced_at: new Date(),
      },
      update: {
        pancake_order_id: posOrder.id,
        shop_id: shopId,
        ads_id: lead.adIds[0],
        status,
        synced_at: new Date(),
        updated_at: new Date(),
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
