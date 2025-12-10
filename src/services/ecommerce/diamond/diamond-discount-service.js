import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default class DiamondDiscountService {
  static getCampaigns() {
    return [
      {
        name: "Flash Sale Phase 1",
        startDate: "2025-12-05",
        endDate: "2025-12-07",
        priority: 10,
        rules: [
          { max: 4.5, percent: 8 },
          { min: 4.5, max: 6.3, percent: 10 },
          { min: 6.3, percent: 12 }
        ]
      },
      {
        name: "Flash Sale Phase 2",
        startDate: "2025-12-12",
        endDate: "2025-12-14",
        priority: 10,
        rules: [
          { max: 4.5, percent: 8 },
          { min: 4.5, max: 6.3, percent: 10 },
          { min: 6.3, percent: 12 }
        ]
      },
      {
        name: "Flash Sale Phase 3",
        startDate: "2025-12-19",
        endDate: "2025-12-21",
        priority: 10,
        rules: [
          { max: 4.5, percent: 8 },
          { min: 4.5, max: 6.3, percent: 10 },
          { min: 6.3, percent: 12 }
        ]
      },
      {
        name: "Early Dec 2025",
        startDate: "2025-12-01",
        endDate: "2025-12-24",
        priority: 5,
        rules: [
          { max: 6.3, percent: 8 },
          { min: 6.3, percent: 12 }
        ]
      },
      {
        name: "Late Dec 2025",
        startDate: "2025-12-25",
        endDate: "2025-12-31",
        priority: 5,
        rules: [
          { max: 4.5, percent: 8 },
          { min: 4.5, percent: 12 }
        ]
      }
    ];
  }

  /**
   * Calculate discount percentage based on campaign rules
   * @param {Object} params
   * @param {string|Date} [params.date] - Current date (defaults to now)
   * @param {number} params.diamondSize - Size of the diamond in mm
   * @param {string} params.productType - 'KCV' (Kim cuong vien) or others
   * @returns {number} Discount percentage (0-100)
   */
  static calculateDiscountPercent({ date = new Date(), diamondSize = 0, productType = "KCV" }) {
    // Only handle KCV as per request
    if (productType !== "KCV") return 0;

    const now = dayjs(date).tz("Asia/Ho_Chi_Minh");
    const campaigns = this.getCampaigns().sort((a, b) => b.priority - a.priority);

    for (const campaign of campaigns) {
      const start = dayjs.tz(campaign.startDate, "Asia/Ho_Chi_Minh").startOf("day");
      const end = dayjs.tz(campaign.endDate, "Asia/Ho_Chi_Minh").endOf("day");

      const isTime = now.isBetween(start, end, null, "[]");

      if (isTime) {
        if (Array.isArray(campaign.rules)) {
          for (const rule of campaign.rules) {
            // Check max condition (if defined)
            if (rule.max !== undefined && diamondSize >= rule.max) {
              continue;
            }
            // Check min condition (if defined)
            if (rule.min !== undefined && diamondSize < rule.min) {
              continue;
            }
            return rule.percent;
          }
        }
      }
    }

    return 0;
  }
}

