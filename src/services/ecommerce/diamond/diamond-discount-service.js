import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import FrappeClient from "src/frappe/frappe-client";
import * as Sentry from "@sentry/cloudflare";

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
          ["is_active", "=", 1],
          ["is_expired", "=", 1],
          ["start_date", "<=", now],
          ["end_date", ">=", now]
        ],
        limit_page_length: 1000
      });

      const rules = promotions.sort((a, b) => {
        if (a.priority === b.priority) return 0;
        if (!a.priority) return 1;
        if (!b.priority) return -1;
        return a.priority.localeCompare(b.priority, undefined, { numeric: true });
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
}
