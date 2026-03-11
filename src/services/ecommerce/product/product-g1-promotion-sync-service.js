import HaravanAPI from "services/clients/haravan-client";
import Database from "services/database";
import * as Sentry from "@sentry/cloudflare";
import { sleep } from "services/utils/sleep";

const COLLECTION_ID = 1004297849;
const TARGET_PROMOTION = "16%";

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
    }
  }

  async _syncCreateCollects(haravanClient) {
    const records = await this.db.$queryRaw`
      SELECT 
        ${COLLECTION_ID} AS collection_id,
        p.haravan_product_id AS product_id
      FROM workplace.products p 
        LEFT JOIN haravan.collection_product cp ON p.haravan_product_id = cp.product_id
          AND cp.collection_id = ${COLLECTION_ID}
      WHERE p.g1_promotion = ${TARGET_PROMOTION} 
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

      await sleep(200);
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
        AND cp.collection_id = ${COLLECTION_ID}
    `;

    for (const record of records) {
      const collectId = Number(record.id);

      try {
        await haravanClient.collect.deleteCollect(collectId);
        await this.db.$executeRaw`DELETE FROM haravan.collection_product WHERE id = ${collectId}`;
      } catch (error) {
        if (error.response?.status === 422) {
          await this.db.$executeRaw`DELETE FROM haravan.collection_product WHERE id = ${collectId}`;
        } else {
          Sentry.captureException(error);
        }
      }

      await sleep(200);
    }
  }
}
