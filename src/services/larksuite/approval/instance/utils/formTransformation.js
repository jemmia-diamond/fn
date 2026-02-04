import { APPROVALS } from "services/larksuite/approval/constant";

const widgetsArrayToObject = (form) => {
  const widgets = JSON.parse(form);
  return widgets.reduce((acc, item) => {
    acc[item.id] = item.value;
    return acc;
  }, {});
};

const accessNestedKey = (data, keys) => {
  return keys.reduce((a, key) => a[key], data);
};

export const transformOffboardData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  const widgetFieldMapper = APPROVALS.OFFBOARD_APPROVAL.widgetFieldMapper;

  return {
    offboard_reason: accessNestedKey(widgetsObj, widgetFieldMapper.offboardReason),
    offboard_date: accessNestedKey(widgetsObj, widgetFieldMapper.offboardDesireDate),
    handover_start_date: accessNestedKey(widgetsObj, widgetFieldMapper.handoverStartDate),
    handover_receiver: accessNestedKey(widgetsObj, widgetFieldMapper.handoverReceiver)
  };
};

export const transformLeaveFormData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  const widgetFieldMapper = APPROVALS.LEAVE_APPROVAL.widgetFieldMapper;
  return {
    start: accessNestedKey(widgetsObj, widgetFieldMapper.start),
    end: accessNestedKey(widgetsObj, widgetFieldMapper.end),
    unit: accessNestedKey(widgetsObj, widgetFieldMapper.unit),
    reason: accessNestedKey(widgetsObj, widgetFieldMapper.reason),
    interval: Number(accessNestedKey(widgetsObj, widgetFieldMapper.interval)),
    name: accessNestedKey(widgetsObj, widgetFieldMapper.name)
  };
};

export const transformPaymentFormData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  const widgetFieldMapper = APPROVALS.PAYMENT_APPROVAL.widgetFieldMapper;
  return {
    type: accessNestedKey(widgetsObj, widgetFieldMapper.type),
    purchase_occurrence: accessNestedKey(widgetsObj, widgetFieldMapper.purchase_occurrence),
    reason: accessNestedKey(widgetsObj, widgetFieldMapper.reason),
    description: accessNestedKey(widgetsObj, widgetFieldMapper.description),
    qualified_document: accessNestedKey(widgetsObj, widgetFieldMapper.qualified_document),
    total_amount: accessNestedKey(widgetsObj, widgetFieldMapper.total_amount),
    payment_info: accessNestedKey(widgetsObj, widgetFieldMapper.payment_info),
    expected_payment_date: accessNestedKey(widgetsObj, widgetFieldMapper.expected_payment_date)
  };
};

export const transformPurchaseFormData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  const widgetFieldMapper = APPROVALS.PURCHASE_APPROVAL.widgetFieldMapper;
  return {
    reason: accessNestedKey(widgetsObj, widgetFieldMapper.reason),
    description: accessNestedKey(widgetsObj, widgetFieldMapper.description),
    estimated_amount: accessNestedKey(widgetsObj, widgetFieldMapper.estimated_amount),
    expected_receive_date: accessNestedKey(widgetsObj, widgetFieldMapper.expected_receive_date)
  };
};

export const transformExchangeBuybackdData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  const widgetFieldMapper = APPROVALS.BUYBACK_EXCHANGE.widgetFieldMapper;

  const phoneData = accessNestedKey(widgetsObj, widgetFieldMapper.phone_number);
  const phoneNumber = phoneData ? JSON.stringify(phoneData) : null;

  const productsInfoRaw = accessNestedKey(widgetsObj, widgetFieldMapper.products_info);
  let productsInfo = null;
  let orderCodeFromProducts = null;

  if (productsInfoRaw && Array.isArray(productsInfoRaw)) {
    const products = productsInfoRaw.map(productArray => {
      const product = {};
      productArray.forEach(field => {
        switch(field.id) {
        case "widget17022702745840001":
          product.product_name = field.value;
          break;
        case "widget17022702776620001":
          product.code = field.value;
          break;
        case "widget17022700856220001":
          product.order_code = field.value;
          if (!orderCodeFromProducts) orderCodeFromProducts = field.value;
          break;
        case "widget17022702791970001":
          product.sale_price = field.value;
          break;
        case "widget17022702829840001":
          product.buyback_percentage = field.value;
          break;
        case "widget17022702867880001":
          product.calculated_buyback_price = field.value;
          break;
        case "widget17035700414220001":
          product.buyback_price = field.value;
          break;
        case "widget17022702902740001":
          product.notes = field.value;
          break;
        }
      });
      return product;
    });
    productsInfo = products;
  }

  const mainOrderCode = accessNestedKey(widgetsObj, widgetFieldMapper.order_code);
  const orderCode = mainOrderCode || orderCodeFromProducts;

  return {
    instance_type: accessNestedKey(widgetsObj, widgetFieldMapper.instance_type),
    order_code: orderCode ? orderCode.toString().trim() : null,
    new_order_code: accessNestedKey(widgetsObj, widgetFieldMapper.new_order_code) ?
      accessNestedKey(widgetsObj, widgetFieldMapper.new_order_code).toString().trim() : null,
    customer_name: accessNestedKey(widgetsObj, widgetFieldMapper.customer_name) ?
      accessNestedKey(widgetsObj, widgetFieldMapper.customer_name).toString().trim() : null,
    phone_number: phoneNumber,
    national_id: accessNestedKey(widgetsObj, widgetFieldMapper.national_id),
    reason: accessNestedKey(widgetsObj, widgetFieldMapper.reason) ?
      accessNestedKey(widgetsObj, widgetFieldMapper.reason).toString().trim() : null,
    refund_amount: accessNestedKey(widgetsObj, widgetFieldMapper.refund_amount),
    products_info: productsInfo,
    bank_info: accessNestedKey(widgetsObj, widgetFieldMapper.bank_info),
    handover_date: accessNestedKey(widgetsObj, widgetFieldMapper.handover_date),
    department: accessNestedKey(widgetsObj, widgetFieldMapper.department),
    other_info: accessNestedKey(widgetsObj, widgetFieldMapper.other_info)
  };
};
