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
