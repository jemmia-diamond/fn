import pLimit from "p-limit";
import Database from "services/database";
import PancakePOSSyncService from "services/pancake/pos/pancake-pos-sync-service";
import { HaravanOrderPayload } from "services/haravan/webhook-order";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";
import * as Sentry from "@sentry/cloudflare";

const BATCH_SIZE = 300;
const CONCURRENCY_LIMIT = 10;
const REQUEST_DELAY_MS = 200;
const SINCE_DATE = new Date("2026-01-01T00:00:00Z");

export default async function backfillPancakePosOrderSync(env: any): Promise<void> {
  const db = Database.instance(env);
  const service = new PancakePOSSyncService(env);
  const limit = pLimit(CONCURRENCY_LIMIT);

  let offset = 0;

  while (true) {
    const orders = await db.order.findMany({
      take: BATCH_SIZE,
      skip: offset,
      where: {
        created_at: { gte: SINCE_DATE }
      },
      orderBy: { id: "asc" },
      select: {
        id: true,
        order_number: true,
        name: true,
        note: true,
        cancelled_status: true,
        financial_status: true,
        confirmed_at: true,
        total_price: true,
        total_discounts: true,
        total_line_items_price: true,
        subtotal_price: true,
        total_tax: true,
        total_weight: true,
        shipping_lines: true,
        customer_phone: true,
        customer_first_name: true,
        customer_last_name: true,
        customer_email: true,
        created_at: true,
        updated_at: true,
        ref_order_id: true,
        ref_order_number: true,
        ref_order_date: true,
        utm_source: true,
        utm_medium: true,
        utm_campaign: true,
        utm_term: true,
        utm_content: true,
        tags: true,
        currency: true,
        email: true,
        contact_email: true,
        gateway: true,
        source: true,
        closed_status: true,
        confirmed_status: true,
        fulfillment_status: true
      }
    });

    if (!orders.length) break;

    await Promise.all(
      orders.map((order) =>
        limit(async () => {
          try {
            const payload = mapOrderToPayload(order);

            if (!payload.customer?.phone) {
              return;
            }

            await service.processOrder(payload);
          } catch (e) {
            Sentry.captureException(e);
          } finally {
            await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
          }
        })
      )
    );

    offset += orders.length;
  }
}

function mapOrderToPayload(order: any): HaravanOrderPayload {
  return {
    id: order.id,
    order_number: order.order_number,
    name: order.name,
    note: order.note,
    cancelled_status: order.cancelled_status,
    financial_status: order.financial_status ?? "pending",
    confirmed_at: order.confirmed_at?.toISOString(),
    total_price: order.total_price,
    total_discounts: order.total_discounts,
    total_line_items_price: order.total_line_items_price,
    subtotal_price: order.subtotal_price,
    total_tax: order.total_tax,
    total_weight: order.total_weight,
    shipping_lines: order.shipping_lines ?? [],
    customer: {
      phone: order.customer_phone,
      first_name: order.customer_first_name,
      last_name: order.customer_last_name,
      email: order.customer_email
    },
    created_at: order.created_at?.toISOString(),
    updated_at: order.updated_at?.toISOString(),
    ref_order_id: order.ref_order_id,
    ref_order_number: order.ref_order_number,
    ref_order_date: order.ref_order_date?.toISOString(),
    utm_source: order.utm_source,
    utm_medium: order.utm_medium,
    utm_campaign: order.utm_campaign,
    utm_term: order.utm_term,
    utm_content: order.utm_content,
    tags: order.tags,
    currency: order.currency,
    email: order.email,
    contact_email: order.contact_email,
    gateway: order.gateway,
    source: order.source,
    closed_status: order.closed_status,
    confirmed_status: order.confirmed_status,
    fulfillment_status: order.fulfillment_status,
    haravan_topic: HARAVAN_TOPIC.CREATED
  };
}
