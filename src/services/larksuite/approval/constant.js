import {
  transformLeaveFormData,
  transformPaymentFormData,
  transformPurchaseFormData,
  transformOffboardData
} from "services/larksuite/approval/instance/utils/formTransformation";

export const APPROVALS = {
  LEAVE_APPROVAL: {
    code: "01658309-3806-44E0-A077-1B5E164C1C64",
    formTransformFunction: transformLeaveFormData,
    widgetFieldMapper: {
      start: ["widgetLeaveGroupV2", "start"],
      end: ["widgetLeaveGroupV2", "end"],
      unit: ["widgetLeaveGroupV2", "unit"],
      reason: ["widgetLeaveGroupV2", "reason"],
      interval: ["widgetLeaveGroupV2", "interval"],
      name: ["widgetLeaveGroupV2", "name"]
    }
  },
  PAYMENT_APPROVAL: {
    code: "1B72AFFE-46D8-44E2-B0C1-0B07E800E24F",
    formTransformFunction: transformPaymentFormData,
    widgetFieldMapper: {
      type: ["widget17006371313490001"],
      purchase_occurrence: ["widget17211214457820001"],
      reason: ["widget17096981353550001"],
      description: ["widget17006369838020001"],
      qualified_document: ["widget17230221450530001"],
      total_amount: ["widget17006372249800001"],
      payment_info: ["widget17006373118010001"],
      expected_payment_date: ["widget17006373325040001"]
    }
  },
  PURCHASE_APPROVAL: {
    code: "5B91FC83-0365-435F-8A2D-F4A500CF1BE3",
    formTransformFunction: transformPurchaseFormData,
    widgetFieldMapper: {
      reason: ["widget17519456028420001"],
      description: ["widget17464364605980001"],
      estimated_amount: ["widget17394169374020001"],
      expected_receive_date: ["widget17394170111200001"]
    }
  },
  OFFBOARD_APPROVAL: {
    code: "5A3637EE-DFC5-4837-9C69-8AF57DB7721E",
    formTransformFunction: transformOffboardData,
    widgetFieldMapper: {
      offboardReason: ["widget17001290928990001"],
      offboardDesireDate: ["widget17001290376100001"],
      handoverStartDate: ["widget17001290517750001"],
      handoverReceiver: ["widget17001290735190001"]
    }
  }
};
