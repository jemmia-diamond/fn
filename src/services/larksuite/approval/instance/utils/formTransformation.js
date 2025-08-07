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
    type: widgetsObj[widgetFieldMapper.type],
    purchase_occurrence: widgetsObj[widgetFieldMapper.purchase_occurrence],
    reason: widgetsObj[widgetFieldMapper.reason],
    description: widgetsObj[widgetFieldMapper.description],
    qualified_document: widgetsObj[widgetFieldMapper.qualified_document],
    total_amount: widgetsObj[widgetFieldMapper.total_amount],
    payment_info: widgetsObj[widgetFieldMapper.payment_info],
    expected_payment_date: widgetsObj[widgetFieldMapper.expected_payment_date]
  };
};

export const transformPurchaseFormData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  const widgetFieldMapper = APPROVALS.PURCHASE_APPROVAL.widgetFieldMapper;
  return {
    reason: widgetsObj[widgetFieldMapper.reason],
    description: widgetsObj[widgetFieldMapper.description],
    estimated_amount: widgetsObj[widgetFieldMapper.estimated_amount],
    expected_receive_date: widgetsObj[widgetFieldMapper.expected_receive_date]
  };
};

