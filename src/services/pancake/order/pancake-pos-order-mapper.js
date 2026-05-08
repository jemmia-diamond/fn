export default class PancakePOSOrderMapper {
  static mapHaravanToPancakeOrder(haravanOrder, config) {
    const shippingAddress = haravanOrder.shipping_address || {};
    const billingAddress = haravanOrder.billing_address || {};
    const customer = haravanOrder.customer || {};

    const totalPrice = (haravanOrder.line_items || []).reduce(
      (sum, item) => sum + parseFloat(item.price || 0) * (item.quantity || 1), 0
    );
    const itemNames = (haravanOrder.line_items || [])
      .map(item => item.name || item.title)
      .filter(Boolean)
      .join(" + ");

    const items = [{
      quantity: 1,
      discount_each_product: 0,
      is_bonus_product: false,
      is_discount_percent: false,
      is_wholesale: false,
      one_time_product: true,
      variation_info: {
        name: itemNames || haravanOrder.order_number || "",
        retail_price: totalPrice,
        weight: null,
        detail: null,
        fields: null,
        display_id: null,
        product_display_id: null
      }
    }];

    const conversationId = this.extractConversationId(haravanOrder);

    const orderData = {
      bill_full_name: shippingAddress.name || billingAddress.name || customer.name || "",
      bill_phone_number: shippingAddress.phone || billingAddress.phone || customer.phone || "",
      conversation_id: conversationId || config.conversation_id || null,
      is_free_shipping: this.isFreeShipping(haravanOrder),
      received_at_shop: false,
      page_id: config.page_id || null,
      items: items,
      note: haravanOrder.note || haravanOrder.customer_note || "",
      note_print: null,
      merge_order: false,
      returned_reason: null,
      warehouse_id: config.warehouse_id || null,
      shipping_address: {
        full_name: shippingAddress.name || billingAddress.name || customer.name || "",
        phone_number: shippingAddress.phone || billingAddress.phone || customer.phone || "",
        address: shippingAddress.address1 || "",
        commune_id: shippingAddress.ward_code || null,
        district_id: shippingAddress.district_code || null,
        province_id: shippingAddress.province_code || null,
        post_code: shippingAddress.zip || null,
        country_code: null,
        full_address: this.buildFullAddress(shippingAddress)
      },
      shipping_fee: this.calculateShippingCost(haravanOrder),
      shop_id: config.shop_id,
      total_discount: parseFloat(haravanOrder.total_discounts || 0),
      warehouse_info: config.warehouse_info || null,
      custom_id: haravanOrder.order_number || "",
      activated_promotion_advances: [],
      status: this.mapOrderStatus(haravanOrder.financial_status),
      cash: this.calculateCashAmount(haravanOrder),
      prepaid: this.calculatePrepaidAmount(haravanOrder)
    };

    return orderData;
  }

  static extractConversationId(haravanOrder) {
    const pancakeData = haravanOrder.pancake_data;
    if (!pancakeData) return null;

    try {
      const parsed = typeof pancakeData === "string" ? JSON.parse(pancakeData) : pancakeData;
      return parsed.conversation_id || null;
    } catch {
      return null;
    }
  }

  static buildFullAddress(shippingAddress) {
    const parts = [
      shippingAddress.address1,
      shippingAddress.ward,
      shippingAddress.district,
      shippingAddress.province
    ].filter(Boolean);

    return parts.join(", ") || "";
  }

  static isFreeShipping(haravanOrder) {
    if (!haravanOrder.shipping_lines || haravanOrder.shipping_lines.length === 0) {
      return true;
    }

    const totalShipping = haravanOrder.shipping_lines.reduce((total, line) => {
      return total + parseFloat(line.price || 0);
    }, 0);

    return totalShipping === 0;
  }

  static mapOrderStatus(financialStatus) {
    switch (financialStatus) {
    case "paid":
      return 1;
    case "partially_paid":
      return 1;
    case "pending":
      return 0;
    case "refunded":
      return 2;
    case "voided":
      return 2;
    default:
      return 0;
    }
  }

  static calculateShippingCost(haravanOrder) {
    if (!haravanOrder.shipping_lines || haravanOrder.shipping_lines.length === 0) {
      return 0;
    }

    return haravanOrder.shipping_lines.reduce((total, line) => {
      return total + parseFloat(line.price || 0);
    }, 0);
  }

  static isCODPayment(haravanOrder) {
    const gateway = haravanOrder.gateway?.toLowerCase() || "";
    const processingMethod = haravanOrder.processing_method?.toLowerCase() || "";
    return gateway.includes("cod") ||
           processingMethod.includes("cod") ||
           processingMethod.includes("cash");
  }

  static calculateCashAmount(haravanOrder) {
    return this.isCODPayment(haravanOrder) ? parseFloat(haravanOrder.total_price) : 0;
  }

  // Prepaid = amount already paid upfront (online payment, bank transfer, card, etc.)
  // For COD orders, prepaid = 0 (payment collected on delivery)
  static calculatePrepaidAmount(haravanOrder) {
    if (this.isCODPayment(haravanOrder)) return 0;

    const isPaid = ["paid", "partially_paid"].includes(haravanOrder.financial_status);
    return isPaid ? parseFloat(haravanOrder.total_price) : 0;
  }
}
