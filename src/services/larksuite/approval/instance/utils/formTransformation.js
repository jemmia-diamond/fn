const widgetsArrayToObject = (form) => {
  const widgets = JSON.parse(form);
  return widgets.reduce((acc, item) => {
    acc[item.id] = item.value;
    return acc;
  }, {});
};

export const transformLeaveFormData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);

  return {
    start: widgetsObj.widgetLeaveGroupV2.start,
    end: widgetsObj.widgetLeaveGroupV2.end,
    unit: widgetsObj.widgetLeaveGroupV2.unit,
    reason: widgetsObj.widgetLeaveGroupV2.reason,
    interval: Number(widgetsObj.widgetLeaveGroupV2.interval),
    name: widgetsObj.widgetLeaveGroupV2.name
  };
};

export const transformPaymentFormData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  return {
    type: widgetsObj.widget17006371313490001,
    purchase_occurrence: widgetsObj.widget17211214457820001,
    reason: widgetsObj.widget17096981353550001,
    description: widgetsObj.widget17006369838020001,
    qualified_document: widgetsObj.widget17230221450530001,
    total_amount: widgetsObj.widget17006372249800001,
    payment_info: widgetsObj.widget17006373118010001,
    expected_payment_date: widgetsObj.widget17006373325040001
  };
};

export const transformPurchaseFormData = (form) => {
  const widgetsObj = widgetsArrayToObject(form);
  return {
    reason: widgetsObj.widget17519456028420001,
    description: widgetsObj.widget17464364605980001,
    estimated_amount: widgetsObj.widget17394169374020001,
    expected_receive_date: widgetsObj.widget17394170111200001
  };
};

