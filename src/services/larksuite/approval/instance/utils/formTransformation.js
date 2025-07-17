export const transformLeaveFormData = (form) => {
  const widgets = JSON.parse(form);
  const widgetsObj = widgets.reduce((acc, item) => {
    acc[item.id] = item.value;
    return acc;
  }, {});

  return {
    start: widgetsObj.widgetLeaveGroupV2.start,
    end: widgetsObj.widgetLeaveGroupV2.end,
    unit: widgetsObj.widgetLeaveGroupV2.unit,
    reason: widgetsObj.widgetLeaveGroupV2.reason,
    interval: Number(widgetsObj.widgetLeaveGroupV2.interval),
    name: widgetsObj.widgetLeaveGroupV2.name
  }
}
