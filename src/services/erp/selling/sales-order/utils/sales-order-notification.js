import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

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
    if (item.g0) { promotionNames.push(item.g0); };
    if (item.g1) { promotionNames.push(item.g1); };
    if (item.g2) { promotionNames.push(item.g2); };
    if (item.g3) { promotionNames.push(item.g3); };
    if (item.g4) { promotionNames.push(item.g4); };
    if (item.g5) { promotionNames.push(item.g5); };
    if (item.g6) { promotionNames.push(item.g6); };
    if (item.g7) { promotionNames.push(item.g7); };
  }

  const promotions = salesOrder.promotions;
  for (const promotion of promotions) {
    promotionNames.push(promotion.promotion);
  }
  return promotionNames;
};
