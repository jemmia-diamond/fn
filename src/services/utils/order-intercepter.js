export function isTestOrder(orderData) {
  const customerData = orderData.customer;
  const billingAddress = orderData.billing_address;

  const testFields = [
    customerData.first_name,
    customerData.last_name,
    billingAddress.name
  ];

  return testFields.some(field => field.includes("test"));
}

export function isReorder(orderData) {
  const orderId = orderData.id;
  const lastOrderId = orderData.customer.last_order_id;

  return (orderId != lastOrderId);
}
