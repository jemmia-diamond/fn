import pLimit from "p-limit";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import { SheetConnector } from "services/clients/lark-client";
import { sleep } from "services/utils/sleep";
import * as Sentry from "@sentry/cloudflare";

const WIKI_NODE_TOKEN = "Gi6hwTTcGiUEshkbkgrlOJ1Pgph";
const SHEET_ID = "GuneIA";
const REQUIRED_FIELDS = ["product_id", "variant_id", "Giá mới cần đổi"];
const CONCURRENCY = 5;
const REQUEST_DELAY_MS = 200;

export default async function updateWeddingRingPrices(env: any): Promise<void> {
  const sheet = new SheetConnector(env);
  const haravan = new HaravanAPI(env.HARAVAN_TOKEN);
  const db = Database.instance(env);
  const limit = pLimit(CONCURRENCY);

  const spreadsheetToken = await sheet.resolveSpreadsheetToken(WIKI_NODE_TOKEN);
  const rows = await sheet.readRange(spreadsheetToken, SHEET_ID, "A:ZZ");
  if (!rows.length) return;

  const header = rows[0].map((h: any) => String(h ?? "").trim());
  const colIdx: Record<string, number> = {};
  for (const f of REQUIRED_FIELDS) {
    const i = header.indexOf(f);
    if (i < 0) {
      throw new Error(`Missing column "${f}" in sheet. Found: ${header.join(", ")}`);
    }
    colIdx[f] = i;
  }

  const tasks: { productId: number; variantId: number; price: number }[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const pid = row[colIdx["product_id"]];
    const vid = row[colIdx["variant_id"]];
    const raw = row[colIdx["Giá mới cần đổi"]];
    const price = raw == null || raw === "" ? NaN : parseFloat(String(raw).replace(/[^\d.-]/g, ""));
    if (!pid || !vid || !Number.isFinite(price) || price <= 0) continue;
    tasks.push({ productId: Number(pid), variantId: Number(vid), price });
  }

  console.warn(`[wedding-ring-price-sync] ${tasks.length} variants to update`);

  let ok = 0;
  let fail = 0;
  await Promise.all(
    tasks.map((t) =>
      limit(async () => {
        try {
          await haravan.productVariant.updateVariant(t.variantId, { price: t.price });
          ok++;
        } catch (e) {
          fail++;
          Sentry.captureException(e, {
            tags: {
              variant_id: String(t.variantId),
              product_id: String(t.productId)
            }
          });
        } finally {
          await sleep(REQUEST_DELAY_MS);
        }
      })
    )
  );

  console.warn(`[wedding-ring-price-sync] done: ok=${ok}, fail=${fail}`);

  await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_products;`;
  console.warn("[wedding-ring-price-sync] materialized_products refreshed");
}
