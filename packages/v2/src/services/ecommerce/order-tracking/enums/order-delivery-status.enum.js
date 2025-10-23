export const OrderOverallStatus = Object.freeze({
  READY_TO_CONFIRM: {
    key: "ready_to_confirm",
    label: "Chờ xác nhận",
  },
  CONFIRMED: {
    key: "confirmed",
    label: "Đã xác nhận",
  },
  READY_TO_PICK: {
    key: "ready_to_pick",
    label: "Chờ lấy hàng",
  },
  PICKING: {
    key: "picking",
    label: "Đang lấy hàng",
  },
  DELIVERING: {
    key: "delivering",
    label: "Đang giao hàng",
  },
  DELIVERED: {
    key: "delivered",
    label: "Đã giao hàng",
  },
  NOT_MEET_CUSTOMER: {
    key: "not_meet_customer",
    label: "Không gặp được khách",
  },
  WAITING_FOR_RETURN: {
    key: "waiting_for_return",
    label: "Chờ hoàn hàng",
  },
  RETURNED: {
    key: "returned",
    label: "Đã hoàn hàng",
  },
  CANCELLED: {
    key: "cancelled",
    label: "Đã hủy đơn",
  },
});

export const NhattinDeliveryStatus = Object.freeze({
  TAKE_ORDER_FROM_VENDOR: 3,
  TRANSITING: 15,
  DELIVERED: 4,
});

export const NhattinPaymentMethod = Object.freeze({
  NGTTN: { id: 10, name: "Người Gửi Thanh Toán Ngay" },
  NGTTS: { id: 11, name: "Người Gửi Thanh Toán Sau" },
  NNTTN: { id: 20, name: "Người Nhận Thanh Toán Ngay" },
});

export const HaravanDeliverySendLocation = Object.freeze({
  HO_CHI_MINH: "nhat_tin_jemmia_hcm",
  HANOI: "nhat_tin_jemmia_hn",
  CAN_THO: "nhat_tin_jemmia_ct",
});
