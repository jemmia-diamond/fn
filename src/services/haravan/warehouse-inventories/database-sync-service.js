import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import * as crypto from "crypto";
import { sleep } from "services/utils/sleep.js";

dayjs.extend(utc);

const VARIANT_CHUNK_SIZE = 20;
const LOCATION_CHUNK_SIZE = 5;

export default class DatabaseSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;
  static DEFAULT_KV_KEY = "haravan_warehouse_inventory_sync:last_date";

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
    const KV_KEY = DatabaseSyncService.DEFAULT_KV_KEY;
    const toDate = dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const lastSyncDate = await kv.get(KV_KEY);

    const fromDate = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").format("YYYY-MM-DDTHH:mm:ss[Z]")
      : dayjs().utc().subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]");

    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanAPI(HRV_API_KEY);

      const variantIds = await this._fetchUpdatedVariantIds(haravanClient, fromDate);
      if (variantIds.length === 0) {
        await kv.put(KV_KEY, toDate);
        return;
      }

      const locationIds = await this._fetchLocationIds(haravanClient);
      if (locationIds.length === 0) {
        throw new Error("No locations found");
      }
      await this._processInventoryChunks(haravanClient, variantIds, locationIds);
      await kv.put(KV_KEY, toDate);
    } catch {
      if (lastSyncDate && dayjs(toDate).diff(dayjs(lastSyncDate), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
      return;
    }
  }

  async _fetchUpdatedVariantIds(haravanClient, updatedAtMin) {
    let page = 1;
    let hasMore = true;
    const variantIds = [];
    const limit = 50;

    while (hasMore) {
      if (page > 1) {
        await sleep(DatabaseSyncService.RATE_LIMIT_DELAY_MS);
      }

      const response = await haravanClient.product.getProducts({
        updated_at_min: updatedAtMin,
        page,
        limit
      });
      const products = response?.products || [];

      for (const product of products) {
        for (const variant of product?.variants || []) {
          variantIds.push(variant.id);
        }
      }

      if (products.length > 0) {
        page++;
      } else {
        hasMore = false;
      }
    }

    return variantIds;
  }

  async _fetchLocationIds(haravanClient) {
    const response = await haravanClient.location.getLocations();
    const locations = response?.locations || [];
    return locations.map(l => l.id);
  }

  async _processInventoryChunks(haravanClient, variantIds, locationIds) {
    for (let li = 0; li < locationIds.length; li += LOCATION_CHUNK_SIZE) {
      const locationChunk = locationIds.slice(li, li + LOCATION_CHUNK_SIZE);
      const strLocationIds = locationChunk.join(",");

      for (let vi = 0; vi < variantIds.length; vi += VARIANT_CHUNK_SIZE) {
        if (li > 0 || vi > 0) {
          await sleep(DatabaseSyncService.RATE_LIMIT_DELAY_MS);
        }

        const variantChunk = variantIds.slice(vi, vi + VARIANT_CHUNK_SIZE);
        const strVariantIds = variantChunk.join(",");

        const response = await haravanClient.inventoryLocation.getInventoryLocations({
          location_ids: strLocationIds,
          variant_ids: strVariantIds
        });

        const inventoryLocations = response?.inventory_locations || [];
        if (inventoryLocations.length > 0) {
          await this._upsertBatch(inventoryLocations);
        }
      }
    }
  }

  _mapInventoryLocation(item) {
    return {
      id: item.id ? BigInt(item.id) : null,
      loc_id: item.loc_id ? BigInt(item.loc_id) : null,
      product_id: item.product_id ? BigInt(item.product_id) : null,
      variant_id: item.variant_id ? BigInt(item.variant_id) : null,
      qty_onhand: item.qty_onhand ?? 0,
      qty_committed: item.qty_committed ?? 0,
      qty_available: item.qty_available ?? 0,
      qty_incoming: item.qty_incoming ?? 0,
      updated_at: item.updated_at ? dayjs(item.updated_at).toDate() : null
    };
  }

  async _upsertBatch(inventoryLocations) {
    const toUpsert = inventoryLocations.map(item => this._mapInventoryLocation(item));
    if (toUpsert.length === 0) return;

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = toUpsert.map(data => {
        const id = data.id;
        delete data.id;

        return tx.haravan_warehouse_inventories.upsert({
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
