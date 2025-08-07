import {
  transformLeaveFormData,
  transformPaymentFormData,
  transformPurchaseFormData
} from "services/larksuite/approval/instance/utils/formTransformation";

export const APPROVALS = {
  LEAVE_APPROVAL: {
    code: "01658309-3806-44E0-A077-1B5E164C1C64",
    formtransformFunction: transformLeaveFormData
  },
  PAYMENT_APPROVAL: {
    code: "1B72AFFE-46D8-44E2-B0C1-0B07E800E24F",
    formtransformFunction: transformPaymentFormData
  },
  PURCHASE_APPROVAL: {
    code: "5B91FC83-0365-435F-8A2D-F4A500CF1BE3",
    formtransformFunction: transformPurchaseFormData
  }
};
