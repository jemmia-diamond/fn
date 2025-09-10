import { stringSquish } from "services/utils/string-helper";

export function negativeStockOrderMessage(order, variants) {
  const message = stringSquish(`
    Order #${order.order_number} is out of stock for the following variants:
    ${variants.map(variant => `- ${variant.sku}`).join("\n")}
  `);

  return message;
}
