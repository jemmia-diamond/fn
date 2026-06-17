import pLimit from "p-limit";
import Database from "services/database";
import PancakePosClient from "services/pancake/pos/pancake-pos-client";
import * as Sentry from "@sentry/cloudflare";

const BATCH_SIZE = 300;
const CONCURRENCY_LIMIT = 10;
const REQUEST_DELAY_MS = 200;
const SINCE_DATE = new Date("2026-01-01T00:00:00Z");
const UNTIL_DATE = new Date("2026-06-17T23:59:59Z");

export default async function backfillPancakePosInsertedAt(env: any): Promise<void> {
  const db = Database.instance(env);
  const client = new PancakePosClient(env.PANCAKE_POS_API_KEY);
  const limit = pLimit(CONCURRENCY_LIMIT);

  let offset = 0;

  while (true) {
    const syncs = await db.pancakePOSOrderSync.findMany({
      take: BATCH_SIZE,
      skip: offset,
      where: {
        created_at: { gte: SINCE_DATE, lte: UNTIL_DATE },
        pancake_order_id: { not: null },
        shop_id: { not: null }
      },
      orderBy: { created_at: "asc" },
      select: {
        haravan_order_id: true,
        pancake_order_id: true,
        shop_id: true
      }
    });

    if (!syncs.length) break;

    await Promise.all(
      syncs.map((sync) =>
        limit(async () => {
          if (!sync.pancake_order_id || !sync.shop_id) {
            return;
          }

          const order = await db.order.findFirst({
            where: { id: Number(sync.haravan_order_id) },
            select: { created_at: true }
          });

          if (!order?.created_at) {
            return;
          }

          try {
            await client.updateOrderInsertedAt(sync.shop_id, sync.pancake_order_id, order.created_at.toISOString());
          } catch (e) {
            Sentry.captureException(e, {
              tags: {
                haravan_order_id: String(sync.haravan_order_id),
                pancake_order_id: String(sync.pancake_order_id)
              }
            });
          } finally {
            await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
          }
        })
      )
    );

    offset += syncs.length;
  }
}
