import { SKU_LENGTH, SKU_PREFIX } from "services/haravan/products/product-variant/constant";
import { numberToCurrency } from "services/utils/number-helper";

export const validateOrderCompleteness = (salesOrderData, customer) => {
  let message = null;

  if (!salesOrderData.sales_team.length) {
    message = "Chưa nhập chia doanh số";
    return { isValid: false, message };
  }

  if (!customer.passport_id && !customer.personal_id) {
    message = "Chưa nhập số hộ chiếu hoặc số CMND/CCCD khách hàng";
    return { isValid: false, message };
  }

  if (!customer.customer_journey) {
    message = "Chưa nhập hành trình khách hàng";
    return { isValid: false, message };
  }

  if (!customer.first_source) {
    message = "Chưa nhập mã kênh tiếp cận đầu tiên cho khách hàng";
    return { isValid: false, message };
  }

  if (!salesOrderData.primary_sales_person) {
    message = "Chưa nhập nhân viên phụ trách chính";
    return { isValid: false, message };
  }

  if (!salesOrderData.policies.length) {
    message = "Chưa nhập chính sách đơn hàng";
    return { isValid: false, message };
  }

  if (!salesOrderData.product_categories.length) {
    message = "Chưa nhập đặc điểm sản phẩm đơn hàng";
    return { isValid: false, message };
  }

  if (!salesOrderData.expected_delivery_date) {
    message = "Chưa nhập ngày giao hàng";
    return { isValid: false, message };
  }

  if (!salesOrderData.expected_payment_date) {
    message = "Chưa nhập ngày thanh toán";
    return { isValid: false, message };
  }

  if (!salesOrderData.consultation_date) {
    message = "Chưa nhập ngày tư vấn";
    return { isValid: false, message };
  }

  const lineItems = salesOrderData.items;

  if (lineItems.some(item => item.sku === null)) {
    message = "Chưa nhập SKU sản phẩm, vui lòng kiểm tra lại";
    return { isValid: false, message };
  }

  const jewelryItems = lineItems.filter((item) => (item.sku?.length === SKU_LENGTH.JEWELRY || item.sku?.startsWith(SKU_PREFIX.TEMPORARY_JEWELRY)));
  for (const jewelryItem of jewelryItems) {
    if (!jewelryItem.serial_numbers) {
      message = "Chưa nhập serial number";
      return { isValid: false, message };
    }
  }

  const jewelryAndDiamondItems = lineItems.filter((item) => (item.sku?.length === SKU_LENGTH.JEWELRY || item.sku?.startsWith(SKU_PREFIX.DIAMOND)));
  for (const item of jewelryAndDiamondItems) {
    if (!(item.promotion_1 || item.promotion_2 || item.promotion_3 || item.promotion_4)) {
      message = "Chưa nhập chương trình khuyến mãi cho sản phẩm trang sức hoặc kim cương";
      return { isValid: false, message };
    }
  }

  return { isValid: true, message: null };
};

const PRIORITY_LEVELS = {
  G0: 0,
  G1: 1,
  G2: 2,
  G3: 3,
  G4: 4,
  G5: 5,
  G6: 6,
  G7: 7
};

export const validatePromotions = (salesOrderData, promotionData = []) => {
  const lineItems = salesOrderData.items;

  // Create lookup map for promotions
  const promotionMap = new Map();
  promotionData.forEach(p => promotionMap.set(p.name, p));

  const itemValidation = _validateItemLevelPromotions(lineItems, promotionMap);
  if (!itemValidation.isValid) {
    return { isValid: false, message: itemValidation.message };
  }

  return _validateOrderLevelPromotions(salesOrderData, lineItems, promotionMap);
};

const _validateItemLevelPromotions = (lineItems, promotionMap) => {
  const TOLERANCE = 10000;
  const errors = [];

  for (let i = 0; i < lineItems.length; i++) {
    const item = lineItems[i];
    const promoNames = [item.promotion_1, item.promotion_2, item.promotion_3, item.promotion_4].filter(Boolean);
    const promotions = promoNames.map(name => promotionMap.get(name)).filter(Boolean);
    const sortedPromotions = _sortPromotions(promotions);

    let expectedRate = item.price_list_rate;

    for (const promo of sortedPromotions) {
      expectedRate = _applyPromotionToPrice(expectedRate, promo, "Line Item");
    }

    // Actual item amount vs Expected item amount (per unit check or total check? usually total logic is safer for rounding, but existing logic was per item diff * qty. Let's do total for the item line)
    const expectedLineAmount = Math.floor(expectedRate) * item.qty;
    const actualLineAmount = item.rate * item.qty;

    const diff = Math.abs(expectedLineAmount - actualLineAmount);

    if (diff > TOLERANCE) {
      errors.push(`[Dòng ${i + 1}] Sản phẩm ${item.item_name} giá sai lệch ${numberToCurrency(diff)}. Giá mong đợi: ${numberToCurrency(expectedLineAmount)}, Giá thực tế: ${numberToCurrency(actualLineAmount)}.`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      message: errors.join("\n")
    };
  }

  return { isValid: true };
};

const _validateOrderLevelPromotions = (salesOrderData, lineItems, promotionMap) => {
  const TOLERANCE = 10000;

  // Recalculate Pre-Discount Total based on actual item rates (since they passed validation)
  const totalPreDiscountPrice = lineItems.reduce((sum, item) => sum + (item.rate * item.qty), 0);

  const orderPromoList = salesOrderData.promotions || [];
  const promotions = orderPromoList.map(p => promotionMap.get(p.promotion)).filter(Boolean);
  const sortedPromotions = _sortPromotions(promotions);

  let expectedGrandTotal = totalPreDiscountPrice;

  for (const promo of sortedPromotions) {
    expectedGrandTotal = _applyPromotionToPrice(expectedGrandTotal, promo, "Order");
  }

  const tradeInAmount = salesOrderData.custom_trade_in_amount || 0;
  expectedGrandTotal = expectedGrandTotal - tradeInAmount;

  const actualGrandTotal = salesOrderData.grand_total;
  const diff = Math.abs(expectedGrandTotal - actualGrandTotal);

  if (diff > TOLERANCE) {
    return {
      isValid: false,
      message: `Tổng đơn hàng sai lệch ${numberToCurrency(diff)}. Giá mong đợi: ${numberToCurrency(expectedGrandTotal)}, Giá thực tế: ${numberToCurrency(actualGrandTotal)}.`
    };
  }

  return { isValid: true, message: null };
};

const _sortPromotions = (promotions) => {
  return promotions.sort((a, b) => {
    const pA = PRIORITY_LEVELS[a.priority] || 99;
    const pB = PRIORITY_LEVELS[b.priority] || 99;
    return pA - pB;
  });
};

const _applyPromotionToPrice = (price, promotion, scope) => {
  if (scope === "Line Item") {
    // G0: No Discount
    if (promotion.priority === "G0") return price;
    // G1: % Product
    if (promotion.priority === "G1") {
      return price * (1 - (promotion.discount_percent || 0) / 100);
    }
    // G2: Fixed Product
    if (promotion.priority === "G2") {
      return price - (promotion.discount_amount || 0);
    }
    // G3: Gift or Discount
    if (promotion.priority === "G3") {
      if (promotion.discount_type === "Percentage") {
        return price * (1 - (promotion.discount_percent || 0) / 100);
      }
      if (promotion.discount_type === "Fix Amount") {
        return price - (promotion.discount_amount || 0);
      }
      return price;
    }
  }

  if (scope === "Order") {
    // G4: Fixed Order
    if (promotion.priority === "G4") {
      return price - (promotion.discount_amount || 0);
    }
    // G5: % Order
    if (promotion.priority === "G5") {
      return price * (1 - (promotion.discount_percent || 0) / 100);
    }
    // G6: Rounding (handled by tolerance, no calc change)
    if (promotion.priority === "G6") return price;
    // G7: Order Gift or Discount
    if (promotion.priority === "G7") {
      if (promotion.discount_type === "Percentage") {
        return price * (1 - (promotion.discount_percent || 0) / 100);
      }
      if (promotion.discount_type === "Fix Amount") {
        return price - (promotion.discount_amount || 0);
      }
      return price;
    }
  }

  return price;
};

export const validateSalesOrder = (salesOrderData, customer, promotionData) => {
  const completenessValidation = validateOrderCompleteness(salesOrderData, customer);
  if (!completenessValidation.isValid) {
    return completenessValidation;
  }

  return validatePromotions(salesOrderData, promotionData);
};
