import { WorkplaceClient } from "services/clients/workplace-client";
import DiamondDiscountService from "services/ecommerce/diamond/diamond-discount-service";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import HaravanClient from "services/clients/haravan-client";
import * as Sentry from "@sentry/cloudflare";

dayjs.extend(utc);
dayjs.extend(timezone);

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

  async createFinalDiscountPromotions() {
    try {
      const db = Database.instance(this.env);

      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      if (!HRV_API_KEY) {
        throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
      }

      const haravanClient = new HaravanClient(HRV_API_KEY);

      // Cleanup existing "Final Discount Price" promotions (latest 100)
      try {
        const [page1Data, page2Data] = await Promise.all([
          haravanClient.promotion.list({ limit: 50, page: 1 }),
          haravanClient.promotion.list({ limit: 50, page: 2 })
        ]);

        const existingPromotions = [
          ...(page1Data.promotions || []),
          ...(page2Data.promotions || [])
        ];

        console.warn(`Checking ${existingPromotions.length} latest promotions for cleanup...`);

        for (const promo of existingPromotions) {
          if (promo.name && promo.name.includes("Final Discount Price")) {
            try {
              await haravanClient.promotion.delete(promo.id);
              console.warn(`Deleted old promotion: ${promo.id} - ${promo.name}`);
            } catch (deleteError) {
              console.warn(`Failed to delete promotion ${promo.id}:`, deleteError);
            }
          }
        }
      } catch (cleanupError) {
        console.warn("Error cleaning up existing promotions:", cleanupError);
        Sentry.captureException(cleanupError);
      }

      const variants = await db.$queryRaw`
        SELECT
          haravan_variant_id,
          haravan_product_id,
          final_discount_price
        FROM
          workplace.variants
        WHERE
          final_discount_price IS NOT NULL
      `;

      if (!variants || variants.length === 0) {
        // eslint-disable-next-line no-console
        console.info("No variants with final_discount_price found.");
        return;
      }

      console.warn(`Found ${variants.length} variants with final_discount_price.`);

      const startDate = dayjs.tz("2025-12-22 00:00:00", "Asia/Ho_Chi_Minh").format();
      const endDate = dayjs.tz("2025-12-31 23:59:59", "Asia/Ho_Chi_Minh").format();

      for (const variant of variants) {
        try {
          const promotionPayload = {
            name: `Final Discount Price - ${variant.haravan_variant_id}`,
            discount_type: "same_price",
            value: Number(variant.final_discount_price),
            applies_to_resource: "product_variant",
            starts_at: startDate,
            ends_at: endDate,
            applies_to_quantity: 1,
            usage_limit: null,
            cant_combine_with_other_discounts: true,
            variants: [
              {
                product_id: Number(variant.haravan_product_id),
                variant_id: Number(variant.haravan_variant_id)
              }
            ]
          };

          await haravanClient.promotion.create(promotionPayload);
        } catch (error) {
          console.warn(`Failed to create promotion for variant ${variant.haravan_variant_id}:`, error);
          Sentry.captureException(error);
        }
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error in createFinalDiscountPromotions:", error);
      Sentry.captureException(error);
    }
  }
}
