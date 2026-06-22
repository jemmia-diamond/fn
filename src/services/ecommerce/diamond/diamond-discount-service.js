import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import FrappeClient from "src/frappe/frappe-client";
import * as Sentry from "@sentry/cloudflare";
import { Prisma } from "@prisma/client";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default class DiamondDiscountService {

  /**
   * Fetch active promotion rules from database
   * @param {Object} env - Environment variables
   * @returns {Promise<Array>} List of active rules
   */
  static async getActiveRules(env) {
    try {
      const frappeClient = new FrappeClient({
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      });

      const now = dayjs().format("YYYY-MM-DD");

      const promotions = await frappeClient.getList("Promotion", {
        fields: "*",
        filters: [
          ["product_category", "=", "Kim Cương Viên"],
          ["discount_type", "=", "Percentage"],
          ["promotion_type", "=", "Khuyến mãi nền"],
          ["is_active", "=", 1],
          ["is_expired", "=", 1],
          ["start_date", "<=", now],
          ["end_date", ">=", now],
          ["title", "like", "%mới%"]
        ],
        or_filters: [
          ["min_value", ">", 0],
          ["max_value", ">", 0]
        ],
        limit_page_length: 1000
      });

      const rules = promotions.sort((a, b) => {
        const priorityA = a.priority;
        const priorityB = b.priority;

        if (priorityA == null && priorityB == null) return 0;
        if (priorityA == null) return 1;
        if (priorityB == null) return -1;

        return priorityA - priorityB;
      });

      return rules;
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  /**
   * Calculate discount percentage based on fetched rules
   * @param {Object} params
   * @param {number} params.diamondSize - Size of the diamond in mm
   * @param {Array} params.rules - List of active rules fetched from DB
   * @returns {number} Discount percentage (0-100)
   */
  static calculateDiscountPercent({ diamondSize = 0, rules = [] }) {
    if (!rules || rules.length === 0) return 0;

    for (const rule of rules) {
      const hasMin = rule.min_value != null && rule.min_value !== "" && rule.min_value > 0;
      const hasMax = rule.max_value != null && rule.max_value !== "" && rule.max_value > 0;

      if (hasMin && hasMax) {
        if (diamondSize < rule.min_value || diamondSize >= rule.max_value) continue;
      }
      else if (hasMin && !hasMax) {
        if (diamondSize < rule.min_value) continue;
      }
      else if (!hasMin && hasMax) {
        if (diamondSize >= rule.max_value) continue;
      }

      return rule.discount_percent;
    }

    return 0;
  }

  static async getCollectionIdFromRules(haravanProductId, category, env) {
    let matchedCollectionId = null;
    const allDiscountCollectionIds = new Set();
    if (!haravanProductId) {
      return { matchedCollectionId, allDiscountCollectionIds };
    }

    try {
      const db = new Database(env);
      const nocodb = new NocoDBClient(env);
      const promotions = await this._fetchActiveSqlPromotions(category, env);

      const sortedPromotions = promotions.sort((a, b) => {
        const pA = a.rule_priority ?? 999999;
        const pB = b.rule_priority ?? 999999;
        return pA - pB;
      });

      for (const promo of sortedPromotions) {
        if (!promo.discount_percent || promo.discount_percent <= 0) continue;

        try {
          const collectionRes = await nocodb.listRecords(NOCODB_TABLES.MARKETING.HARAVAN_COLLECTIONS, {
            where: `(discount_type,eq,percent)~and(discount_value,eq,${promo.discount_percent})`,
            limit: 1,
            fields: "id"
          });
          if (collectionRes.list && collectionRes.list.length > 0) {
            const colId = collectionRes.list[0].id.toString();
            allDiscountCollectionIds.add(colId);

            if (!matchedCollectionId) {
              const condition = Prisma.raw(promo.custom_haravan_sql_condition);
              const match = await db.$queryRaw`
                SELECT 1
                FROM workplace.products wp
                LEFT JOIN workplace.variants wv ON wv.product_id = wp.id
                LEFT JOIN workplace.variant_serials wvs ON wvs.variant_id = wv.id
                WHERE wp.haravan_product_id = ${BigInt(haravanProductId)} AND ( ${condition} )
                LIMIT 1
              `;

              if (match && match.length > 0) {
                matchedCollectionId = colId;
              }
            }
          }
        } catch (err) {
          Sentry.captureException(err);
        }
      }

      return { matchedCollectionId, allDiscountCollectionIds };
    } catch (error) {
      Sentry.captureException(error);
      return { matchedCollectionId, allDiscountCollectionIds };
    }
  }

  static async _fetchActiveSqlPromotions(category, env) {
    try {
      const frappeClient = new FrappeClient({
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      });

      return await frappeClient.getList("Promotion", {
        filters: [
          ["is_active", "=", 1],
          ["product_category", "=", category],
          ["custom_haravan_sql_condition", "is", "set"]
        ],
        fields: "name,title,discount_percent,custom_haravan_sql_condition,rule_priority",
        limit_page_length: 1000
      });
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }
}
