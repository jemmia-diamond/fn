import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default class DiamondDiscountService {
  /**
   * Calculate discount percentage based on rules
   * @param {Object} params
   * @param {string|Date} [params.date] - Current date (defaults to now)
   * @param {number} params.diamondSize - Size of the diamond in mm
   * @param {string} params.productType - 'KCV' (Kim cuong vien) or 'VTS' (Vo trang suc)
   * @param {number} [params.bundleDiamondSize] - Size of the bundled diamond (if productType is VTS and bought with KCV)
   * @returns {number} Discount percentage (0-100)
   */
  static calculateDiscountPercent({ date = new Date(), diamondSize = 0, productType = "KCV" }) {
    // Current date in ICT
    const now = dayjs(date).tz("Asia/Ho_Chi_Minh");
    const year = 2025; // Explicitly set to 2025 as per request "till 31/12/2025"

    // Helper to check date range (inclusive)
    const isDateIn = (startDay, endDay, month = 12) => {
      // Handle month boundary if needed, but here all are Dec 2025
      const start = dayjs.tz(`${year}-${month}-${startDay}`, "Asia/Ho_Chi_Minh").startOf("day");
      const end = dayjs.tz(`${year}-${month}-${endDay}`, "Asia/Ho_Chi_Minh").endOf("day");
      return now.isBetween(start, end, null, "[]");
    };

    // 1. Flash Sale Dates check (Priority)
    // 05-07, 12-14, 19-21 Dec
    const isFlashSale = isDateIn(5, 7) || isDateIn(12, 14) || isDateIn(19, 21);

    if (isFlashSale) {
      if (productType === "KCV") {
        if (diamondSize < 4.5) return 8;
        if (diamondSize < 6.3) return 10; // 4.5 <= x < 6.3
        return 12; // >= 6.3
      }
      if (productType === "VTS") {
        return 16;
      }
    }

    // 2. Early Dec (01 - 24 Dec)
    // Note: If falling through from Flash Sale, it means it's NOT a flash sale date.
    if (isDateIn(1, 24)) {
      if (productType === "KCV") {
        if (diamondSize < 6.3) return 8;
        return 12; // >= 6.3
      }
      if (productType === "VTS") {
        return 16;
      }
    }

    // 3. Late Dec (25 - 31 Dec)
    if (isDateIn(25, 31)) {
      if (productType === "KCV") {
        if (diamondSize < 4.5) return 8;
        return 12; // >= 4.5
      }
      if (productType === "VTS") {
        return 16;
      }
    }

    return 0;
  }
}
