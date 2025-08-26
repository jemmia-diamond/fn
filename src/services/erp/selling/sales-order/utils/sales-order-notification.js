import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { SKU_LENGTH } from "services/haravan/products/product-variant/constant";

dayjs.extend(utc);

export const composeSalesOrderNotification = (salesOrder, promotionData) => {
  const time = dayjs().format("DD-MM-YYYY HH:mm:ss");
  const orderNumber = salesOrder.order_number;

  const orderPromotionNames = salesOrder.promotions.map((promotion) => promotion.promotion);
  const orderPromotions = promotionData.filter((promotion) => orderPromotionNames.includes(promotion.name));

  const expectedPaymentDate = dayjs(salesOrder.expected_payment_date).format("DD-MM-YYYY");

  const content = `
<b>[${time}] JEMMIA xác nhận đơn hàng #${orderNumber}</b>

Mã khách hàng: ${salesOrder.customer}

${salesOrder.items.map((item, idx) => composeItemContent(item, idx + 1)).join("\n\n")}

Thông tin toàn đơn hàng:
- Tổng đơn hàng: ${formatVietnameseCurrency(salesOrder.grand_total)}
- Chiết khấu đơn hàng: ${salesOrder.discount_amount}
- Số tiền đã cọc: ${formatVietnameseCurrency(salesOrder.paid_amount)}
- Số tiền còn lại: ${formatVietnameseCurrency(salesOrder.balance)}
- Ngày thanh toán dự kiến: ${expectedPaymentDate}
- Chương trình khuyến mãi toàn đơn: ${composePromotionContent(orderPromotions)}
    `.trim();
  return content;
};

const composeItemContent = (item, idx) => {
  const serialNumbers = item.serial_numbers ? item.serial_numbers.split("\n").join(", ") : "";
  const content = `
${idx}. ${item.item_name}
Mã gốc: ${item.variant_title}
SKU: ${item.sku}
Số lượng: ${item.qty}
${serialNumbers ? `Số serial: ${serialNumbers}` : ""}
Giá gốc: ${formatVietnameseCurrency(item.price_list_rate)}
Giá khuyến mãi: ${formatVietnameseCurrency(item.rate)}
    `.trim().replace(/\n+/g, "\n");
  return content;
};

const composePromotionContent = (promotions) => {
  const titles = promotions.map((promotion) => promotion.title);
  return titles.join(", ");
};

function formatVietnameseCurrency(amount) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

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

export function validateOrderInfo(salesOrderData) {
  let message = null;
  let isValid = false;

  if (!salesOrderData.product_categories.length) {
    message = "Chưa nhập đặc điểm sản phẩm đơn hàng";
    return {isValid, message};
  }

  if (!salesOrderData.expected_delivery_date) {
    message = "Chưa nhập ngày giao hàng";
    return {isValid, message};
  }

  if (!salesOrderData.expected_payment_date) {
    message = "Chưa nhập ngày thanh toán";
    return {isValid, message};
  }

  const lineItems = salesOrderData.items;

  const jewelryItems = lineItems.filter((item) => item.sku.length === SKU_LENGTH.JEWELRY);
  for (const jewelryItem of jewelryItems) {
    if (!jewelryItem.serial_numbers) {
      message = "Chưa nhập serial number";
      return {isValid, message};
    }
  }

  isValid = true;
  return {isValid, message};
}
