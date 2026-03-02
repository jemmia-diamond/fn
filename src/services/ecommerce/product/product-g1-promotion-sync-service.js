import HaravanAPI from "services/clients/haravan-client";
import Database from "services/database";
import * as Sentry from "@sentry/cloudflare";

export default class ProductG1PromotionSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async syncPromotions() {
    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      const haravanClient = new HaravanAPI(HRV_API_KEY);

      await this._syncCreateCollects(haravanClient);
      await this._syncDeleteCollects(haravanClient);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async _syncCreateCollects(haravanClient) {
    const records = await this.db.$queryRaw`
      SELECT 
        1004297849 AS collection_id,
        p.haravan_product_id AS product_id
      FROM workplace.products p 
        LEFT JOIN haravan.collection_product cp ON p.haravan_product_id = cp.product_id
          AND cp.collection_id = 1004297849
      WHERE p.g1_promotion = '16%' 
        AND cp.id IS NULL
        AND p.haravan_product_id IS NOT NULL 
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

      await this._sleep(200);
    }
  }

  async _syncDeleteCollects(haravanClient) {
    const records = await this.db.$queryRaw`
      SELECT
        cp.id
      FROM workplace.products p 
        INNER JOIN haravan.collection_product cp ON cp.product_id = p.haravan_product_id
      WHERE 1 = 1
        AND p.g1_promotion = 'None'
        AND p.haravan_product_id IS NOT NULL 
        AND cp.collection_id = 1004297849
    `;

    for (const record of records) {
      const collectId = Number(record.id);

      try {
        await haravanClient.collect.deleteCollect(collectId);
      } catch (error) {
        Sentry.captureException(error);
      }

      await this._sleep(200);
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
