import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { SKU_LENGTH, SKU_PREFIX } from "services/haravan/products/product-variant/constant";
import { numberToCurrency } from "services/utils/number-helper";
import { stringSquishLarkMessage } from "services/utils/string-helper";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const composeSalesOrderNotification = (salesOrder, promotionData, leadSource, policyData, productCategoryData, customer, primarySalesPerson, secondarySalesPeople) => {
  const hcmTime = dayjs().tz("Asia/Ho_Chi_Minh");
  const time = hcmTime.format("DD-MM-YYYY HH:mm:ss");
  const orderNumber = salesOrder.order_number;

  const orderPromotionNames = salesOrder.promotions.map((promotion) => promotion.promotion);
  const orderPromotions = promotionData.filter((promotion) => orderPromotionNames.includes(promotion.name));

  const expectedPaymentDate = dayjs(salesOrder.expected_payment_date).format("DD-MM-YYYY");

  const secondarySalesPeopleNameList = secondarySalesPeople.map((salesPerson) => salesPerson.sales_person_name);

  let content = "";
  content += `
    <b>[${time}] JEMMIA xác nhận đơn hàng #${orderNumber}</b>
  `;

  content += `
    Mã khách hàng: ${salesOrder.customer}
  `;

  salesOrder.items.map((item, idx) => {
    content += composeItemContent(item, idx + 1, promotionData.filter((promotion) => [item.promotion_1, item.promotion_2, item.promotion_3, item.promotion_4].includes(promotion.name)));
  });

  content += `
    * <b>Thông tin toàn đơn hàng</b>:
    - Tổng đơn hàng: ${numberToCurrency(salesOrder.grand_total)}
    - Ngày tư vấn: ${dayjs(salesOrder.consultation_date).format("DD-MM-YYYY")}
    - Chiết khấu đơn hàng: ${salesOrder.discount_amount}
    - Số tiền đã cọc: ${numberToCurrency(salesOrder.paid_amount || salesOrder.deposit_amount || 0)}
    - Số tiền còn lại: ${numberToCurrency(salesOrder.grand_total - (salesOrder.paid_amount || salesOrder.deposit_amount || 0))}
    - Ngày thanh toán dự kiến: ${expectedPaymentDate}
    - Kênh tiếp cận đầu tiên: ${leadSource.source_name}
    - Hành trình khách hàng: ${customer.customer_journey}
  `;

  content += `
    * <b>Đặc điểm sản phẩm đơn hàng</b>:\n${composeChildrenContent(productCategoryData, "title")}
  `;

  content += `
    * <b>Chính sách bảo hành</b>:\n${composeChildrenContent(policyData, "title")}
  `;

  const ordPromotion = orderPromotions && Array.isArray(orderPromotions) && orderPromotions.length > 0 ?
    composeChildrenContent(orderPromotions, "title")
    : " - Không";
  content += `
    * <b>Chương trình khuyến mãi toàn đơn</b>:\n${ordPromotion}
  `;

  const secondSales = secondarySalesPeopleNameList.length ?
    `\n - Phụ: ${secondarySalesPeopleNameList.join(", ")}` : "";
  content += `
    * Nhân viên phụ trách:\n- Chính: ${primarySalesPerson.sales_person_name}${secondSales}
  `;

  content += `
    * Link đơn hàng: https://erp.jemmia.vn/app/sales-order/${salesOrder.name}
  `;
  return stringSquishLarkMessage(content);
};

const composeItemContent = (item, idx, promotionData) => {
  if (item.sku.startsWith(SKU_PREFIX.GIFT)) {
    return `
      ${idx}. ${item.item_name}
      Mã gốc: ${item.variant_title}
    `;
  }

  const serialNumbers = item.serial_numbers ? item.serial_numbers.split("\n").join(", ") : "";
  const content = `
    ${idx}. ${item.item_name}
    Mã gốc: ${ item.sku.startsWith(SKU_PREFIX.DIAMOND) ? extractVariantNameForGIA(item.variant_title) : extractVariantNameForJewelry(item.variant_title)}
    SKU: ${item.sku}
    Số lượng: ${item.qty}
    Số serial: ${serialNumbers} 
    Giá: ${numberToCurrency(item.price_list_rate)}
    Giá khuyến mãi: ${numberToCurrency(item.rate)}
    CTKM:
    ${composeChildrenContent(promotionData, "title")}
  `;
  return content;
};

export const extractPromotions = (salesOrder) => {
  const promotionNames = [];
  const items = salesOrder.items;
  for (const item of items) {
    if (item.promotion_1) { promotionNames.push(item.promotion_1); };
    if (item.promotion_2) { promotionNames.push(item.promotion_2); };
    if (item.promotion_3) { promotionNames.push(item.promotion_3); };
    if (item.promotion_4) { promotionNames.push(item.promotion_4); };
  }

  const promotions = salesOrder.promotions;
  for (const promotion of promotions) {
    promotionNames.push(promotion.promotion);
  }
  return promotionNames;
};

export function validateOrderInfo(salesOrderData, customer) {
  let message = null;
  let isValid = false;

  if (!salesOrderData.sales_team.length) {
    message = "Chưa nhập chia doanh số";
    return { isValid, message };
  }

  if (!customer.customer_journey) {
    message = "Chưa nhập hành trình khách hàng";
    return { isValid, message };
  }

  if (!customer.first_source) {
    message = "Chưa nhập mã kênh tiếp cận đầu tiên cho khách hàng";
    return { isValid, message };
  }

  if (!salesOrderData.primary_sales_person) {
    message = "Chưa nhập nhân viên phụ trách chính";
    return { isValid, message };
  }

  if (!salesOrderData.policies.length) {
    message = "Chưa nhập chính sách đơn hàng";
    return { isValid, message };
  }

  if (!salesOrderData.product_categories.length) {
    message = "Chưa nhập đặc điểm sản phẩm đơn hàng";
    return { isValid, message };
  }

  if (!salesOrderData.expected_delivery_date) {
    message = "Chưa nhập ngày giao hàng";
    return { isValid, message };
  }

  if (!salesOrderData.expected_payment_date) {
    message = "Chưa nhập ngày thanh toán";
    return { isValid, message };
  }

  if (!salesOrderData.consultation_date) {
    message = "Chưa nhập ngày tư vấn";
    return { isValid, message };
  }

  const lineItems = salesOrderData.items;

  const jewelryItems = lineItems.filter((item) => (item.sku.length === SKU_LENGTH.JEWELRY || item.sku.startsWith(SKU_PREFIX.TEMPORARY_JEWELRY)));
  for (const jewelryItem of jewelryItems) {
    if (!jewelryItem.serial_numbers) {
      message = "Chưa nhập serial number";
      return { isValid, message };
    }
  }

  const jewelryAndDiamondItems = lineItems.filter((item) => (item.sku.length === SKU_LENGTH.JEWELRY || item.sku.startsWith(SKU_PREFIX.DIAMOND)));
  for (const item of jewelryAndDiamondItems) {
    if (!(item.promotion_1 || item.promotion_2 || item.promotion_3 || item.promotion_4)) {
      message = "Chưa nhập chương trình khuyến mãi cho sản phẩm trang sức hoặc kim cương";
      return { isValid, message };
    }
  }

  isValid = true;
  return { isValid, message };
}

function composeChildrenContent(children, key) {
  return children
    .map((child) => " - " + child[key])
    .join("\n");
}

function extractVariantNameForGIA(text) {
  const regex = /^(\S+)/;
  const match = text.match(regex);
  return match ? match[1] : null;
}

function extractVariantNameForJewelry(text) {
  const regex = /^(.+? - .+? - .+?) - /;
  const match = text.match(regex);
  return match ? match[1] : null;
}

