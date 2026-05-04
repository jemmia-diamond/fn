import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import ProductMapper from "services/haravan/products/product-mapper";
import * as crypto from "crypto";
import { sleep } from "services/utils/sleep.js";

dayjs.extend(utc);

export default class ProductDatabaseSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;
  static DEFAULT_KV_KEY = "haravan_product_sync:last_date";

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.dbConnection = {
      timeout: 80000,
      maxWait: 15000
    };
  }

  async sync() {
    const kv = this.env.FN_KV;
    const KV_KEY = ProductDatabaseSyncService.DEFAULT_KV_KEY;
    const toDate = dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const lastSyncDate = await kv.get(KV_KEY);

    const fromDate = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").format("YYYY-MM-DDTHH:mm:ss[Z]")
      : dayjs().utc().subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]");

    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanAPI(HRV_API_KEY);

      await this._fetchAndProcessProducts(haravanClient, fromDate);
      await kv.put(KV_KEY, toDate);
    } catch {
      if (lastSyncDate && dayjs(toDate).diff(dayjs(lastSyncDate), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
    }
  }

  async _fetchAndProcessProducts(haravanClient, updatedAtMin) {
    let page = 1;
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
      if (page > 1) {
        await sleep(ProductDatabaseSyncService.RATE_LIMIT_DELAY_MS);
      }

      let skipNextSleep = false;

      try {
        const response = await haravanClient.product.getProducts({
          updated_at_min: updatedAtMin,
          page,
          limit
        });
        const products = response?.products || [];

        if (products.length > 0) {
          const allImages = [];
          for (const product of products) {
            const images = ProductMapper.extractImages(product);
            allImages.push(...images);
          }

          await this._upsertProducts(products);
          await this._upsertImages(allImages);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (error.status === 429) {
          const retryAfter = parseFloat(error.retryAfter || 2);
          if (retryAfter > ProductDatabaseSyncService.MAX_RETRY_AFTER_SECONDS) {
            throw new Error(
              `Rate limited for ${retryAfter}s (exceeds ${ProductDatabaseSyncService.MAX_RETRY_AFTER_SECONDS}s threshold)`
            );
          }
          await sleep(retryAfter * 1000);
          skipNextSleep = true;
          continue;
        }
        throw error;
      }

      if (skipNextSleep && page > 1) {
        page--;
      }
    }
  }

  async _upsertProducts(products) {
    if (!products || products.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = products.map(product => {
        const data = ProductMapper.mapProduct(product);
        const id = data.id;
        delete data.id;

        return tx.haravan_products.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...data,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...data,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }

  async _upsertImages(images) {
    if (!images || images.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = images.map(image => {
        const data = ProductMapper.mapImage(image);
        const id = data.id;
        delete data.id;

        return tx.images.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...data,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...data,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }
}
