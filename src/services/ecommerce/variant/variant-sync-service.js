import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import * as crypto from "crypto";

dayjs.extend(utc);

export default class VariantSyncService {
  static RATE_LIMIT_DELAY_MS = 500;
  static MAX_RETRY_AFTER_SECONDS = 3;
  static DEFAULT_VARIANT_SYNC_KV_KEY = "ecommerce_variant_sync:last_date";
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.dbConnection = {
      timeout: 30000,
      maxWait: 15000
    };
  }

  async syncVariants() {
    const kv = this.env.FN_KV;
    const KV_KEY = VariantSyncService.DEFAULT_VARIANT_SYNC_KV_KEY;
    const toDate = dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const lastSyncDate = await kv.get(KV_KEY);

    const fromDate = lastSyncDate
      ? dayjs(lastSyncDate).subtract(5, "minutes").format("YYYY-MM-DDTHH:mm:ss[Z]")
      : dayjs().utc().subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]");

    const updatedAtMin = fromDate;

    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanAPI(HRV_API_KEY);

      await this._fetchAndProcessVariants(haravanClient, updatedAtMin);
      await kv.put(KV_KEY, toDate);
    } catch {
      if (lastSyncDate && dayjs(toDate).diff(dayjs(lastSyncDate), "hour") >= 1) {
        await kv.put(KV_KEY, toDate);
      }
      return;
    }
  }

  async _fetchAndProcessVariants(haravanClient, updatedAtMin) {
    let page = 1;
    let hasMore = true;
    let skipNextSleep = false;
    const limit = 50;

    while (hasMore) {
      if (page > 1 && !skipNextSleep) {
        await this._sleep(HaravanVariantSyncService.RATE_LIMIT_DELAY_MS);
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
          await this._processVariantBatch(products, updatedAtMin);
          page++;
        } else {
          hasMore = false;
        }

      } catch (error) {
        if (error.status === 429) {
          const retryAfter = parseFloat(error.retryAfter || 2);
          const allowedRetrySeconds = HaravanVariantSyncService.MAX_RETRY_AFTER_SECONDS;

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

  _mapVariant(variant, product) {
    return {
      id: variant.id ? BigInt(variant.id) : null,
      product_id: variant.product_id ? BigInt(variant.product_id) : null,
      published_scope: product.published_scope,
      handle: product.handle,
      product_type: product.product_type,
      template_suffix: product.template_suffix,
      product_title: product.title,
      product_vendor: product.vendor,
      barcode: variant.barcode,
      compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
      created_at: variant.created_at ? dayjs(variant.created_at).toDate() : null,
      fulfillment_service: variant.fulfillment_service,
      grams: variant.grams,
      inventory_management: variant.inventory_management,
      inventory_policy: variant.inventory_policy,
      inventory_quantity: variant.inventory_quantity,
      position: variant.position,
      price: variant.price ? parseFloat(variant.price) : null,
      requires_shipping: variant.requires_shipping === true,
      sku: variant.sku,
      taxable: variant.taxable === true,
      title: variant.title,
      updated_at: variant.updated_at ? dayjs(variant.updated_at).toDate() : null,
      image_id: variant.image_id ? BigInt(variant.image_id) : null,
      option1: variant.option1,
      option2: variant.option2,
      option3: variant.option3,
      qty_onhand: variant?.inventory_advance?.qty_onhand,
      qty_commited: variant?.inventory_advance?.qty_commited,
      qty_available: variant?.inventory_advance?.qty_available,
      qty_incoming: variant?.inventory_advance?.qty_incoming
    };
  }

  async _processVariantBatch(products, updatedAtMin) {
    const variantsToUpsert = [];
    const minDate = dayjs(updatedAtMin);

    for (const product of products) {
      for (const variant of product?.variants || []) {
        if (dayjs(variant.updated_at).isAfter(minDate)) {
          variantsToUpsert.push(this._mapVariant(variant, product));
        }
      }
    }

    if (variantsToUpsert.length === 0) {
      return;
    }

    const currentDateTime = dayjs().utc().toDate();
    await this.db.$transaction(async (tx) => {
      const operations = variantsToUpsert.map(variantData => {
        const id = variantData.id;
        delete variantData.id;

        return tx.haravan_variants.upsert({
          where: { id },
          create: {
            uuid: crypto.randomUUID(),
            id,
            ...variantData,
            database_created_at: currentDateTime,
            database_updated_at: currentDateTime
          },
          update: {
            ...variantData,
            database_updated_at: currentDateTime
          }
        });
      });
      await Promise.all(operations);
    }, this.dbConnection);
  }
}
