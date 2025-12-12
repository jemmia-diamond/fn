import * as Sentry from "@sentry/cloudflare";
import { WorkplaceClient } from "services/clients/workplace-client";
import DiamondDiscountService from "services/ecommerce/diamond/diamond-discount-service";
import Database from "src/services/database";

export default class DiamondCollectService {
  constructor(env) {
    this.env = env;
  }

  async syncDiamondsToCollects() {
    try {
      const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
      const workplaceClient = await WorkplaceClient.initialize(this.env, WORKPLACE_BASE_ID);

      const db = Database.instance(this.env);
      let offset = 0;
      const limit = 100;

      while (true) {
        const diamonds = await db.$queryRaw`
          SELECT
            d.*
          FROM
            workplace.diamonds d
          LEFT JOIN (
            SELECT variant_id, SUM(qty_available) as total_qty
            FROM haravan.warehouse_inventories
            GROUP BY variant_id
          ) i ON d.variant_id = i.variant_id
          WHERE
            d.auto_create_haravan_product = true
            AND d.product_id > 0
            AND d.variant_id > 0
            AND (
              d.is_incoming = true
              OR COALESCE(i.total_qty, 0) > 0
            )
          ORDER BY
            d.id DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;

        if (!diamonds || diamonds.length === 0) {
          break;
        }

        for (const diamond of diamonds) {
          try {
            const discountPercent = DiamondDiscountService.calculateDiscountPercent({
              diamondSize: parseFloat(diamond.edge_size_2 || 0),
              productType: "KCV"
            });

            let haravanCollectionId = null;
            if (discountPercent === 8) haravanCollectionId = 32;
            else if (discountPercent === 10) haravanCollectionId = 34;
            else if (discountPercent === 12) haravanCollectionId = 33;

            // Get existing collections for this diamond
            const existingEntries = await workplaceClient.diamondHaravanCollections.list({
              where: `(diamond_id,eq,${diamond.id})`
            });

            const existingList = existingEntries.list || [];

            // 1. Remove invalid entries (only for 10% and 12% collections)
            for (const entry of existingList) {
              // If we have an entry for 33 (12%) or 34 (10%), but it's not the current valid collection, remove it.
              if ((entry.haravan_collection_id === 33 || entry.haravan_collection_id === 34) && entry.haravan_collection_id !== haravanCollectionId) {
                await workplaceClient.diamondHaravanCollections.delete(entry.id);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }

            // 2. Add new entry if needed
            if (haravanCollectionId) {
              const exists = existingList.some(e => e.haravan_collection_id === haravanCollectionId);
              if (!exists) {
                await workplaceClient.diamondHaravanCollections.create({
                  diamond_id: diamond.id,
                  haravan_collection_id: haravanCollectionId
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.code === "23505" || errorData?.message === "This record already exists.") {
              continue;
            }
            console.warn("Error processing diamond:", diamond.id, error);
            Sentry.captureException(error);
          }
        }

        offset += limit;
      }
    } catch (error) {
      console.warn("Error in syncDiamondsToCollects:", error);
      Sentry.captureException(error);
    }
  }
}
