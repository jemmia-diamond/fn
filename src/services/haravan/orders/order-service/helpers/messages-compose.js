export function negativeStockOrderMessage(order, variants) {
  const message = `
Order #${order.order_number} is out of stock for the following variants:
${variants.map(variant => `- ${variant.sku}`).join("\n")}
    `.trim();

  return message;
}
