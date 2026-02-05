import {
  transformLeaveFormData,
  transformPaymentFormData,
  transformPurchaseFormData,
  transformOffboardData,
  transformExchangeBuybackdData
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
  },
  BUYBACK_EXCHANGE: {
    code: "EA70553F-D8C6-447F-AD9F-36BA1542B5A9",
    formTransformFunction: transformExchangeBuybackdData,
    widgetFieldMapper: {
      instance_type: ["widget17022699020100001"],
      customer_name: ["widget17022701687980001"],
      phone_number: ["widget17022701750620001"],
      national_id: ["widget17222414055270001"],
      reason: ["widget17022702391380001"],
      refund_amount: ["widget17022704878160001"],
      products_info: ["widget17022702605140001"],
      bank_info: ["widget17022705103350001"],
      handover_date: ["widget17023591354370001"],
      department: ["widget17022701340280001"],
      other_info: ["widget17022705582580001"],
      order_code: ["widget17022700856220001"],
      new_order_code: ["widget17702009127030001"]
    }
  },
  AFFILIATE_PAYOUT_APPROVAL: {
    code: "6346B3E2-825C-4BBA-ACE7-E92BDF0E2225"
  }
};
