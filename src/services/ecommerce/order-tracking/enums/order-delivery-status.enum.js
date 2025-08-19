export const OrderOverallStatus = Object.freeze({
  READY_TO_CONFIRM: {
    key: "ready_to_confirm",
    label: "Chờ xác nhận"
  },
  CONFIRMED: {
    key: "confirmed",
    label: "Đã xác nhận"
  },
  READY_TO_PICK: {
    key: "ready_to_pick",
    label: "Chờ lấy hàng"
  },
  DELIVERING: {
    key: "delivering",
    label: "Đang giao hàng"
  },
  DELIVERED: {
    key: "delivered",
    label: "Đã giao hàng"
  },
  NOT_MEET_CUSTOMER: {
    key: "not_meet_customer",
    label: "Không gặp được khách"
  },
  WAITING_FOR_RETURN: {
    key: "waiting_for_return",
    label: "Chờ hoàn hàng"
  },
  RETURNED: {
    key: "returned",
    label: "Đã hoàn hàng"
  },
  CANCELLED: {
    key: "cancelled",
    label: "Đã hủy đơn"
  }
});

export const NhattinDeliveryStatus = Object.freeze({
  TAKE_ORDER_FROM_VENDOR: 3,
  TRANSITING: 15
});
