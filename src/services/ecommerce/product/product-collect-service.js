import * as Sentry from "@sentry/cloudflare";
import { WorkplaceClient } from "services/clients/workplace-client";
import Database from "services/database";

export default class ProductCollectService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async syncProductsToCollects() {
    try {
      const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
      const workplaceClient = await WorkplaceClient.initialize(this.env, WORKPLACE_BASE_ID);

      let offset = 0;
      const limit = 10;

      while (true) {
        const products = await this.db.$queryRaw`
          SELECT mp.workplace_id, p.g1_promotion
          FROM ecom.materialized_products mp
          JOIN workplace.products p ON mp.workplace_id = p.id
          WHERE mp.workplace_id IS NOT NULL
          ORDER BY mp.workplace_id
          LIMIT ${limit}
          OFFSET ${offset}
        `;

        if (!products || products.length === 0) {
          break;
        }

        const HARAVAN_COLLECTION_ID = 31;

        for (const product of products) {
          try {
            const existingCollects = await workplaceClient.jewelryHaravanCollections.list({
              where: `(products_id,eq,${product.workplace_id})~and(haravan_collections_id,eq,${HARAVAN_COLLECTION_ID})`
            });
            const existingCollect = existingCollects.list?.[0];

            if (product.g1_promotion === "16%") {
              if (!existingCollect) {
                await workplaceClient.jewelryHaravanCollections.create({
                  products_id: product.workplace_id,
                  haravan_collections_id: HARAVAN_COLLECTION_ID
                });
              }
            }
          } catch (error) {
            Sentry.captureException(error);
          }
        }

        offset += limit;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
