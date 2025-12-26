export const PAYMENT_ENTRY_WEBHOOK_TOPIC = {
  CREATE: "create",
  UPDATE: "update",
  VERIFY: "verify"
};

export const ERPNEXT_PAYMENT_METHODS = {
  cash: "cash",
  cash_on_delivery: "cash_on_delivery",
  payment_link: "payment_link",
  pos: "pos",
  banking: "banking"
};

/**
 * Internal Vietnamese payment type names
 */
export const INTERNAL_PAYMENT_TYPES = {
  CASH: "Tiền Mặt",
  COD: "COD HTC",
  PAYMENT_LINK: "Cà Thẻ Online",
  POS: "Cà Thẻ Tại Cửa Hàng",
  BANKING: "QR"
};

export const PAYMENT_METHOD_MAPPING = {
  [ERPNEXT_PAYMENT_METHODS.cash]: INTERNAL_PAYMENT_TYPES.CASH,
  [ERPNEXT_PAYMENT_METHODS.cash_on_delivery]: INTERNAL_PAYMENT_TYPES.COD,
  [ERPNEXT_PAYMENT_METHODS.payment_link]: INTERNAL_PAYMENT_TYPES.PAYMENT_LINK,
  [ERPNEXT_PAYMENT_METHODS.pos]: INTERNAL_PAYMENT_TYPES.POS,
  [ERPNEXT_PAYMENT_METHODS.banking]: INTERNAL_PAYMENT_TYPES.BANKING
};

export const QR_PAYMENT_METHODS = [
  ERPNEXT_PAYMENT_METHODS.banking
];

export const MANUAL_PAYMENT_METHODS = [
  ERPNEXT_PAYMENT_METHODS.cash,
  ERPNEXT_PAYMENT_METHODS.cash_on_delivery,
  ERPNEXT_PAYMENT_METHODS.payment_link,
  ERPNEXT_PAYMENT_METHODS.pos
];

export const TRANSFER_STATUS = {
  CONFIRMED: "Xác nhận",
  PENDING: "Chờ",
  CREATING: "Đang tạo",
  REFUND: "Đơn hoàn trả",
  CANCELLED: "Hủy"
};

export const BRANCH_MAPPING = {
  "Cửa hàng HCM": "Hồ Chí Minh",
  "Cửa hàng Hồ Chí Minh": "Hồ Chí Minh",
  "Cửa hàng Hà Nội": "Hà Nội",
  "Cửa hàng Cần Thơ": "Cần Thơ"
};

export const REFERENCE_DOCTYPES = {
  SALES_ORDER: "Sales Order"
};

export const HARAVAN_DEFAULTS = {
  DEPOSIT_ORDER: "Đơn hàng cọc",
  ORDER_LATER: "ORDERLATER"
};

