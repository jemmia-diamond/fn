import { SKU_LENGTH, SKU_PREFIX } from "services/haravan/products/product-variant/constant";

/**
 * Validates the completeness of the sales order data.
 * Checks for missing required fields like sales team, customer info, etc.
 */
const validateOrderCompleteness = (salesOrderData, customer) => {
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

  return { isValid: true, message: null };
};

export const validateSalesOrder = (salesOrderData, customer) => {
  const completenessValidation = validateOrderCompleteness(salesOrderData, customer);
  if (!completenessValidation.isValid) {
    return completenessValidation;
  }

  return { isValid: true, message: null };
};
