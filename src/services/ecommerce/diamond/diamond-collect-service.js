import { WorkplaceClient } from "services/clients/workplace-client";
import DiamondDiscountService from "services/ecommerce/diamond/diamond-discount-service";
import Database from "src/services/database";
import * as Sentry from "@sentry/cloudflare";
/**
 * TODO: Implement linking ERP discount program to noco db's collections
 */

const DISCOUNT_PERCENT_COLLECTION_MAP = {
  8: 32,
  10: 34,
  12: 33
};

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
      const activeRules = await DiamondDiscountService.getActiveRules(this.env);

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
              rules: activeRules
            });

            // eslint-disable-next-line no-console
            console.info("Discount percent for diamond:", diamond.id, discountPercent, diamond.edge_size_2);

            const haravanCollectionId = DISCOUNT_PERCENT_COLLECTION_MAP[discountPercent] || null;

            const existingEntries = await workplaceClient.diamondHaravanCollections.list({
              where: `(diamond_id,eq,${diamond.id})`
            });

            const existingList = existingEntries.list || [];
            const discountCollectionIds = Object.values(DISCOUNT_PERCENT_COLLECTION_MAP);

            for (const entry of existingList) {
              const isDiscountCollection = discountCollectionIds.includes(entry.haravan_collection_id);
              const isCurrentCollection = entry.haravan_collection_id === haravanCollectionId;

              if (isDiscountCollection && !isCurrentCollection) {
                await workplaceClient.diamondHaravanCollections.deleteMany([{
                  diamond_id: diamond.id,
                  haravan_collection_id: entry.haravan_collection_id
                }]);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }

            if (haravanCollectionId) {
              const exists = existingList.some(entry => entry.haravan_collection_id === haravanCollectionId);
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
