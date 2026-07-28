import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";
import FrappeClient from "src/frappe/frappe-client";

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

  static async syncNocoDBDiscountCollections({
    diamond,
    targetCollectionId,
    allPercentCollectionIds,
    defaultCollectionId,
    nocodb,
    existingEntries = null
  }) {
    const tableId = NOCODB_TABLES.MARKETING.DIAMOND_HARAVAN_COLLECTIONS;

    let currentLinks = existingEntries;
    if (!currentLinks) {
      const currentLinksRes = await nocodb.listRecords(tableId, {
        where: `(diamond_id,eq,${diamond.id})`,
        limit: 100,
        fields: "diamond_id,haravan_collection_id"
      });
      currentLinks = currentLinksRes.list || [];
    }

    const linksToDelete = [];
    let hasTarget = false;
    let hasDefault = false;

    for (const link of currentLinks) {
      const linkedColId = link.haravan_collection_id?.toString();
      if (!linkedColId) continue;

      const isPercentCollection = allPercentCollectionIds.has(Number(linkedColId)) || allPercentCollectionIds.has(linkedColId);
      if (!isPercentCollection) {
        continue;
      }

      const isTarget = linkedColId === targetCollectionId?.toString();
      const isDefault = linkedColId === defaultCollectionId?.toString();

      if (isTarget) {
        hasTarget = true;
      }

      if (isDefault) {
        hasDefault = true;
      }

      if (!isTarget && !isDefault) {
        linksToDelete.push({ diamond_id: diamond.id, haravan_collection_id: link.haravan_collection_id });
      }
    }

    if (linksToDelete.length > 0) {
      try {
        await nocodb.deleteRecords(tableId, linksToDelete);
      } catch (e) {
        const cause = e.cause || e.response?.data;
        if (cause?.error !== "ERR_RECORD_NOT_FOUND" && e.response?.status !== 404) {
          console.warn("Failed to cleanup old diamond discount collections:", e);
        }
      }
    }

    if (!hasTarget && targetCollectionId) {
      try {
        await nocodb.createRecords(tableId, {
          diamonds: { id: diamond.id },
          haravan_collections: { id: targetCollectionId }
        });
      } catch (error) {
        const errorData = error.response?.data;
        if (errorData?.code === "23505" || errorData?.message === "This record already exists.") {
        } else {
          throw error;
        }
      }
    }

    if (!hasDefault && defaultCollectionId && defaultCollectionId !== targetCollectionId) {
      try {
        await nocodb.createRecords(tableId, {
          diamonds: { id: diamond.id },
          haravan_collections: { id: defaultCollectionId }
        });
      } catch (error) {
        const errorData = error.response?.data;
        if (errorData?.code === "23505" || errorData?.message === "This record already exists.") {
        } else {
          throw error;
        }
      }
    }
  }
}
