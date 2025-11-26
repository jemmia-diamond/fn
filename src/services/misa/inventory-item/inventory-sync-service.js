import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import Database from "services/database";
import MisaClient from "services/clients/misa-client";
import HaravanAPI from "services/clients/haravan-client";
import ProductToMisaMapper from "services/haravan/dtos/product-to-misa";
import Misa from "services/misa";

export default class MisaInventoryItemSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async syncInventoryItems() {
    const kv = this.env.FN_KV;
    const KV_KEY = "misa_inventory_sync:last_date";
    const toDate = dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const lastSyncDate = await kv.get(KV_KEY);

    const fromDate = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").format("YYYY-MM-DDTHH:mm:ss[Z]")
      : dayjs().utc().subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]");

    const updatedAtMin = fromDate;

    try {
      const misaClient = new MisaClient(this.env);
      await misaClient.getAccessToken();
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanAPI(HRV_API_KEY);

      await this._fetchAndProcessProducts(haravanClient, misaClient, updatedAtMin);
      await kv.put(KV_KEY, toDate);
    } catch (error) {
      if (lastSyncDate && dayjs(toDate).diff(dayjs(lastSyncDate), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }

      Sentry.captureException(error);
    }
  }

  async _fetchAndProcessProducts(haravanClient, misaClient, updatedAtMin) {
    let page = 1;
    let hasMore = true;
    let skipNextSleep = false;
    const limit = 50;

    while (hasMore) {
      if (page > 1 && !skipNextSleep) {
        await this._sleep(MisaInventoryItemSyncService.RATE_LIMIT_DELAY_MS);
      }
      skipNextSleep = false;

      try {
        const response = await haravanClient.product.getProducts({
          updated_at_min: updatedAtMin,
          page,
          limit
        });
        const products = response?.products || [];

        if (products.length > 0) {
          await this._processProductBatch(products, misaClient);
          page++;
        } else {
          hasMore = false;
        }

      } catch (error) {
        if (error.status === 429) {
          const retryAfter = parseFloat(error.retryAfter || 2);
          const allowedRetrySeconds = MisaInventoryItemSyncService.MAX_RETRY_AFTER_SECONDS;

          if (retryAfter > allowedRetrySeconds) {
            throw new Error(
              `Rate limited for ${retryAfter}s (exceeds ${allowedRetrySeconds}s threshold) - aborting sync.`
            );
          }

          await this._sleep(retryAfter * 1000);
          skipNextSleep = true;
          continue;
        }
        throw error;
      }
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _processProductBatch(products, misaClient) {
    if (!products || products.length === 0) {
      return;
    }

    const variants = ProductToMisaMapper.transform(products);
    if (variants.length === 0) {
      return;
    }

    const variantsWithSku = variants.filter(v => v.sku);
    if (variantsWithSku.length === 0) {
      return;
    }

    const skus = variantsWithSku.map(v => v.sku);
    const existingSKUs = await this._checkExistingSKUs(skus);
    const existingSKUSet = new Set(existingSKUs);
    const newVariants = variantsWithSku.filter(v => !existingSKUSet.has(v.sku));

    if (newVariants.length === 0) {
      return;
    }

    const currentTime = String(Date.now());
    const inventoryItems = newVariants.map(variant =>
      Misa.InventoryItemMappingService.transformHaravanItemToMisa(variant, currentTime)
    );

    const misaResponse = await this._saveDictionaryToMisa(misaClient, inventoryItems);

    if (misaResponse.Success === true) {
      await this._trackSyncedItems(newVariants);

    } else {
      const errorMsg = {
        skus: newVariants.map(v => v.sku),
        count: newVariants.length,
        misa_response: misaResponse?.ErrorMessage
      };
      Sentry.captureMessage(`MISA Inventory Item Sync failed at ${currentTime}`, {
        level: "error",
        extra: errorMsg
      });
    }
  }

  async _checkExistingSKUs(skus) {
    const existingItems = await this.db.misaInventoryItem.findMany({
      where: { sku: { in: skus } },
      select: { sku: true }
    });
    return existingItems.map(item => item.sku);
  }

  async _saveDictionaryToMisa(misaClient, inventoryItems) {
    const payload = {
      app_id: this.env.MISA_APP_ID,
      org_company_code: this.env.MISA_ORG_CODE,
      dictionary: inventoryItems
    };

    return await misaClient.saveDictionary(payload);
  }

  async _trackSyncedItems(variants) {
    const upsertOperations = variants.map(variant =>
      this.db.misaInventoryItem.upsert({
        where: { sku: variant.sku },
        create: {
          uuid: crypto.randomUUID(),
          sku: variant.sku
        },
        update: {
          database_updated_at: new Date()
        }
      })
    );
    await this.db.$transaction(upsertOperations);
  }
}
