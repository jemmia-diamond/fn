import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import PancakePOSSyncService from "services/pancake/pos/pancake-pos-sync-service";
import { HARAVAN_TOPIC } from "services/ecommerce/enum";

const BATCH_SIZE = 100;
const DELAY_BETWEEN_ORDERS_MS = 500;
const DELAY_BETWEEN_BATCHES_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function backfillPancakePosOrders(env: any): Promise<void> {
  const db = Database.instance(env);
  const service = new PancakePOSSyncService(env);
  let offset = 0;

  while (true) {
    const orders = await db.order.findMany({
      where: {
        customer_phone: { not: null },
        id: { not: null }
      },
      select: {
        id: true,
        name: true,
        customer_phone: true,
        customer_first_name: true,
        customer_last_name: true,
        financial_status: true,
        fulfillment_status: true,
        total_discounts: true,
        shipping_lines: true
      },
      orderBy: { id: "asc" },
      skip: offset,
      take: BATCH_SIZE
    });

    if (orders.length === 0) break;

    for (const order of orders) {
      if (!order.id) continue;

      try {
        await service.processOrder({
          id: order.id,
          name: order.name ?? "",
          haravan_topic: HARAVAN_TOPIC.CREATED,
          financial_status: order.financial_status ?? "pending",
          fulfillment_status: order.fulfillment_status ?? null,
          customer_phone: order.customer_phone,
          customer_first_name: order.customer_first_name ?? null,
          customer_last_name: order.customer_last_name ?? null,
          total_price: "0",
          subtotal_price: "0",
          total_discounts: order.total_discounts?.toString() ?? "0",
          shipping_lines: (order.shipping_lines as any) ?? []
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { one_off: "backfillPancakePosOrders" },
          extra: { haravan_order_id: order.id }
        });
      }

      await sleep(DELAY_BETWEEN_ORDERS_MS);
    }

    offset += BATCH_SIZE;
    await sleep(DELAY_BETWEEN_BATCHES_MS);
  }
}
