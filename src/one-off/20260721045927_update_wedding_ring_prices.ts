import pLimit from "p-limit";
import Ecommerce from "services/ecommerce";
import HaravanAPI from "services/clients/haravan-client";
import { SheetConnector } from "services/clients/lark-client";
import { sleep } from "services/utils/sleep";
import * as Sentry from "@sentry/cloudflare";

const WIKI_NODE_TOKEN = "TVNSwzVH5iAbWXkSrvVl6OEfgee";
const SHEET_ID = "GuneIA";
const REQUIRED_FIELDS = ["product_id", "variant_id", "Giá mới cần đổi"];
const CONCURRENCY = 5;
const REQUEST_DELAY_MS = 200;

export default async function updateWeddingRingPrices(env: any): Promise<void> {
  console.warn("UPDATE PRICES");
  const sheet = new SheetConnector(env);
  const haravan = new HaravanAPI(env.HARAVAN_TOKEN);
  const limit = pLimit(CONCURRENCY);

  const spreadsheetToken = await sheet.resolveSpreadsheetToken(WIKI_NODE_TOKEN);
  const rows = await sheet.readRange(spreadsheetToken, SHEET_ID, "A1:C276");
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

  const productIds = Array.from(new Set(tasks.map((t) => t.productId)));
  console.warn(`[wedding-ring-price-sync] touching ${productIds.length} products to bump updated_at`);

  let touchOk = 0;
  let touchFail = 0;
  await Promise.all(
    productIds.map((pid) =>
      limit(async () => {
        try {
          const res = await haravan.product.getProduct(pid);
          const currentTitle = res?.product?.title;
          if (!currentTitle) throw new Error(`no title for product ${pid}`);
          await haravan.product.updateProduct(pid, { title: currentTitle });
          touchOk++;
        } catch (e) {
          touchFail++;
          Sentry.captureException(e, { tags: { product_id: String(pid) } });
        } finally {
          await sleep(REQUEST_DELAY_MS);
        }
      })
    )
  );
  console.warn(`[wedding-ring-price-sync] title-touch done: ok=${touchOk}, fail=${touchFail}`);

  await new Ecommerce.VariantSyncService(env).syncVariants();
  console.warn("[wedding-ring-price-sync] variants synced back to neon");

  await Ecommerce.ProductService.refreshMaterializedViews(env);
  console.warn("[wedding-ring-price-sync] materialized views refreshed");
}
