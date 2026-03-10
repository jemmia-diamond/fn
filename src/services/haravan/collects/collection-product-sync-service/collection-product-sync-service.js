import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import * as crypto from "crypto";

dayjs.extend(utc);

export default class CollectionProductSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.dbConnection = {
      timeout: 60000,
      maxWait: 15000
    };
  }

  async syncCollectionProducts() {
    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    const haravanClient = new HaravanAPI(HRV_API_KEY);
    await this._fetchAndProcessCollects(haravanClient);
  }

  async _fetchAndProcessCollects(haravanClient) {
    let page = 1;
    let hasMore = true;
    let skipNextSleep = false;
    const limit = 500;
    const today = dayjs().utc().format("YYYY-MM-DD");

    while (hasMore) {
      if (page > 1 && !skipNextSleep) {
        await this._sleep(CollectionProductSyncService.RATE_LIMIT_DELAY_MS);
      }
      skipNextSleep = false;

      try {
        const response = await haravanClient.collect.getCollects({ page, limit });
        const collects = response?.collects || [];

        if (collects.length > 0) {
          await this._processCollectBatch(collects);

          const lastCollect = collects[collects.length - 1];
          const lastUpdatedAtDay = dayjs(lastCollect.updated_at).utc().format("YYYY-MM-DD");
          if (lastUpdatedAtDay === today) {
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        if (error.status === 429) {
          const retryAfter = parseFloat(error.retryAfter || 2);
          const allowedRetrySeconds = CollectionProductSyncService.MAX_RETRY_AFTER_SECONDS;

          if (retryAfter > allowedRetrySeconds) {
            throw new Error(`Rate limited for ${retryAfter}s (exceeds ${allowedRetrySeconds}s threshold)`);
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

  _mapCollectionProduct(item) {
    return {
      id: item.id ? BigInt(item.id) : null,
      collection_id: item.collection_id ? BigInt(item.collection_id) : null,
      created_at: item.created_at ? dayjs(item.created_at).toDate() : null,
      featured: item.featured === true,
      position: item.position ?? null,
      product_id: item.product_id ? BigInt(item.product_id) : null,
      sort_value: item.sort_value ?? null,
      updated_at: item.updated_at ? dayjs(item.updated_at).toDate() : null
    };
  }

  async _processCollectBatch(collects) {
    const collectionProductsToUpsert = collects.map(item => this._mapCollectionProduct(item));

    if (collectionProductsToUpsert.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = collectionProductsToUpsert.map(data => {
        const id = data.id;
        delete data.id;

        return tx.collection_product.upsert({
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
