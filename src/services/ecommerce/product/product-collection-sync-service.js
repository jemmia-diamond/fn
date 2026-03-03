import HaravanAPI from "services/clients/haravan-client";
import Database from "services/database";
import * as Sentry from "@sentry/cloudflare";
import { sleep } from "services/utils/sleep";

export default class ProductCollectionSyncService {
  constructor(env) {
    this.env = env;
    this.db = new Database(env);
  }

  async syncCollections() {
    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    if (!HRV_API_KEY) {
      console.warn("Missing HARAVAN_TOKEN_SECRET, skipping Haravan collection sync.");
      return;
    }

    try {
      const haravanClient = new HaravanAPI(HRV_API_KEY);
      await this._syncCreateCollects(haravanClient);
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async _syncCreateCollects(haravanClient) {
    const records = await this.db.$queryRaw`
      SELECT 
          hc.haravan_id AS collection_id, 
          p.haravan_product_id AS product_id
      FROM workplace.haravan_collections hc
          CROSS JOIN LATERAL unnest(string_to_array(hc.auto_add_product_type, ',')) AS product_type
          INNER JOIN workplace.products p ON product_type = p.haravan_product_type
          LEFT JOIN haravan.collection_product cp ON hc.haravan_id = cp.collection_id AND p.haravan_product_id = cp.product_id
      WHERE hc.auto_add_product_type IS NOT NULL AND cp.uuid IS NULL;
    `;

    for (const record of records) {
      const collectionId = Number(record.collection_id);
      const productId = Number(record.product_id);

      try {
        await haravanClient.collect.createCollect({
          product_id: productId,
          collection_id: collectionId
        });
      } catch (error) {
        Sentry.captureException(error);
      }

      await sleep(200);
    }
  }
}
