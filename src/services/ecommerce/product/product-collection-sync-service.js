import HaravanAPI from "services/clients/haravan-client";
import Database from "services/database";
import NocoDBClient from "services/clients/nocodb-client";
import * as Sentry from "@sentry/cloudflare";
import { sleep } from "services/utils/sleep";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class ProductCollectionSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async syncCollections() {
    try {
      const HRV_API_KEY = this.env.HARAVAN_TOKEN;
      const haravanClient = new HaravanAPI(HRV_API_KEY);
      const nocoClient = new NocoDBClient(this.env);

      const collections = await this._fetchNocoCollections(nocoClient);
      const activeRules = collections.filter(
        c => c.auto_add_product_type && c.haravan_id
      );

      if (activeRules.length === 0) return;

      const products = await this._fetchNocoProducts(nocoClient);
      const activeProducts = products.filter(
        p => p.haravan_product_id && p.haravan_product_type
      );

      if (activeProducts.length === 0) return;

      const candidateCollects = [];
      for (const col of activeRules) {
        const targetTypes = col.auto_add_product_type
          .split(",")
          .map(t => t.trim())
          .filter(Boolean);

        for (const prod of activeProducts) {
          if (targetTypes.includes(prod.haravan_product_type)) {
            candidateCollects.push({
              collection_id: Number(col.haravan_id),
              product_id: Number(prod.haravan_product_id)
            });
          }
        }
      }

      if (candidateCollects.length === 0) return;

      const existingMappings = await this.db.collection_product.findMany({
        select: {
          collection_id: true,
          product_id: true
        }
      });

      const existingSet = new Set(
        existingMappings.map(m => `${String(m.collection_id)}_${String(m.product_id)}`)
      );

      const toCreate = candidateCollects.filter(
        c => !existingSet.has(`${String(c.collection_id)}_${String(c.product_id)}`)
      );

      for (const collect of toCreate) {
        try {
          await haravanClient.collect.createCollect({
            product_id: collect.product_id,
            collection_id: collect.collection_id
          });
        } catch (error) {
          Sentry.captureException(error);
        }

        await sleep(200);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async _fetchNocoCollections(nocoClient) {
    const list = [];
    let page = 1;
    const limit = 100;
    while (true) {
      const res = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.HARAVAN_COLLECTIONS, {
        limit,
        page,
        fields: ["haravan_id", "auto_add_product_type"]
      });
      const batch = res.list || [];
      list.push(...batch);
      if (batch.length < limit) break;
      page++;
    }
    return list;
  }

  async _fetchNocoProducts(nocoClient) {
    const list = [];
    let page = 1;
    const limit = 1000;
    while (true) {
      const res = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.JEWELRIES, {
        limit,
        page,
        fields: ["haravan_product_id", "haravan_product_type"]
      });
      const batch = res.list || [];
      list.push(...batch);
      if (batch.length < limit) break;
      page++;
    }
    return list;
  }
}
