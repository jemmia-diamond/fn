import Database from "services/database";
import PancakePosClient, { CreateOrderPayload, OrderItem } from "services/pancake/pos/pancake-pos-client";
import { haravanMoneyToNumber, HaravanOrderPayload } from "services/haravan/webhook-order";
import { ResolvedLead } from "services/pancake/pos/types";
import {
  HARAVAN_CANCELLED_STATUS,
  HARAVAN_TOPIC
} from "services/ecommerce/enum";
import { normalizeToStandardFormat } from "services/utils/phone-utils";

const POS_STATUS = {
  NEW: 0,
  CANCELED: 6
} as const;

const PANCAKE_POS_BASE_ORDER_VARIATION_ID = "1b756676-3314-43f5-b03e-4829a166f779";
const PANCAKE_POS_BASE_ORDER_PRODUCT_ID = "2cc80df9-72ef-4267-8577-1ed9c1d2035d";

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
      await service.processOrder(msg.body);
      msg.ack();
    }
  }

  async processOrder(order: HaravanOrderPayload): Promise<void> {
    const ctx = await this.resolveSyncContext(order);
    if (!ctx) return;
    const { shopId, lead } = ctx;

    if (order.haravan_topic === HARAVAN_TOPIC.CREATED) {
      await this.syncOrderCreate(order, shopId, lead);
    } else if (order.haravan_topic === HARAVAN_TOPIC.UPDATED) {
      await this.syncOrderUpdate(order, shopId);
    }
  }

  private async resolveSyncContext(order: HaravanOrderPayload) {
    if (!order.customer?.phone) return;

    const lead = await this.resolveAdsId(order.customer.phone);
    if (!lead) return;

    const shopId = await this.resolveShopId(lead.pageId);
    if (!shopId) return;

    return {
      lead, shopId
    };
  }

  private async resolveAdsId(customerPhone: string): Promise<ResolvedLead | null> {
    const target = normalizeToStandardFormat(customerPhone);
    if (!target) return null;

    const pageCustomer = await this.db.page_customer.findFirst({
      where: {
        phone_numbers_normalize: {
          array_contains: [target]
        }
      },
      orderBy: { updated_at: "desc" },
      select: { customer_id: true }
    });
    if (!pageCustomer?.customer_id) return null;

    const conversation = await this.db.conversation.findFirst({
      where: {
        customer_id: pageCustomer.customer_id,
        type: "INBOX"
      },
      orderBy: { updated_at: "desc" },
      select: { id: true, page_id: true, ad_ids: true }
    });
    if (!conversation?.ad_ids) return null;

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

  private async syncOrderCreate(order: HaravanOrderPayload, shopId: number, lead: ResolvedLead): Promise<void> {
    const existing = await this.db.pancakePOSOrderSync.findUnique({
      where: { haravan_order_id: BigInt(order.id) }
    });
    if (existing?.pancake_order_id) return;

    const status = this.mapStatus(order.cancelled_status);
    const payload = this.buildCreatePayload({ order, lead, status });
    const posOrder = await this.client.createOrder(shopId, payload);

    await this.db.pancakePOSOrderSync.upsert({
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

  private buildCreatePayload({
    order,
    lead,
    status
  }: {
    order: HaravanOrderPayload;
    lead: ResolvedLead;
    status: number;
  }): CreateOrderPayload {
    const customer = order.customer;
    const fullName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || undefined;
    const shippingFee = (order.shipping_lines ?? []).reduce(
      (total, line) => total + haravanMoneyToNumber(line.price),
      0
    );

    return {
      bill_full_name: fullName,
      bill_phone_number: customer?.phone ?? undefined,
      conversation_id: lead.conversationId,
      note: order.note,
      status,
      shipping_fee: shippingFee,
      ad_id: lead.adIds[0],
      page_id: lead.pageId,
      items: [this.buildBaseProductItem(order)]
    };
  }

  private buildBaseProductItem(order: HaravanOrderPayload): OrderItem {
    return {
      discount_each_product: haravanMoneyToNumber(order.total_discounts),
      quantity: 1,
      variation_info: {
        name: "Giá trị đơn hàng",
        retail_price: haravanMoneyToNumber(order.total_price)
      },
      variation_id: PANCAKE_POS_BASE_ORDER_VARIATION_ID,
      product_id: PANCAKE_POS_BASE_ORDER_PRODUCT_ID
    };
  }

  private async syncOrderUpdate(order: HaravanOrderPayload, shopId: number): Promise<void> {
    const sync = await this.db.pancakePOSOrderSync.findUnique({
      where: { haravan_order_id: BigInt(order.id) }
    });
    if (!sync?.pancake_order_id) return;

    const status = this.mapStatus(order.cancelled_status);
    if (sync.status === status) return;

    await this.client.updateOrderStatus(sync.shop_id ?? shopId, sync.pancake_order_id, status);
    await this.db.pancakePOSOrderSync.update({
      where: { haravan_order_id: BigInt(order.id) },
      data: { status, updated_at: new Date() }
    });
  }

  private mapStatus(cancelledStatus: string | null): number {
    const normalizedCancelledStatus = cancelledStatus?.toLowerCase() ?? null;

    if (normalizedCancelledStatus === HARAVAN_CANCELLED_STATUS.CANCELLED) return POS_STATUS.CANCELED;

    return POS_STATUS.NEW;
  }
}
