import Database from "services/database";
import NocoDBClient from "services/clients/nocodb-client";
import * as Sentry from "@sentry/cloudflare";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

const BATCH_SIZE = 100;

export default class ProductAttributesSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async sync() {
    try {
      const nocoClient = new NocoDBClient(this.env);
      const nocoProducts = await this._fetchNocoProducts(nocoClient);
      const validNocoProducts = nocoProducts.filter(p => p.haravan_product_id);

      if (validNocoProducts.length === 0) return;

      const productIds = validNocoProducts.map(p => Number(p.haravan_product_id)).filter(Number.isFinite);
      const hrvProducts = await this.db.haravan_products.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        select: {
          id: true,
          published_scope: true,
          handle: true
        }
      });

      const hrvProductMap = new Map();
      for (const p of hrvProducts) {
        hrvProductMap.set(String(p.id), p);
      }

      const updates = [];
      for (const np of validNocoProducts) {
        const hp = hrvProductMap.get(String(np.haravan_product_id));
        if (!hp) continue;

        const scopeChanged = (np.published_scope || null) !== (hp.published_scope || null);
        const handleChanged = (np.handle || null) !== (hp.handle || null);

        if (scopeChanged || handleChanged) {
          updates.push({
            id: np.id,
            published_scope: hp.published_scope || null,
            handle: hp.handle || null
          });
        }
      }

      for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const chunk = updates.slice(i, i + BATCH_SIZE);
        await nocoClient.updateRecords(NOCODB_TABLES.SUPPLY.JEWELRIES, chunk);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async _fetchNocoProducts(nocoClient) {
    const list = [];
    let page = 1;
    const limit = 1000;
    while (true) {
      const res = await nocoClient.listRecords(NOCODB_TABLES.SUPPLY.JEWELRIES, {
        limit,
        page,
        fields: ["id", "haravan_product_id", "published_scope", "handle"]
      });
      const batch = res.list || [];
      list.push(...batch);
      if (batch.length < limit) break;
      page++;
    }
    return list;
  }
}
