export const OrderOverallStatus = Object.freeze({
  ready_to_confirm: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  ready_to_pick: "Chờ lấy hàng",
  delivering: "Đang giao hàng",
  delivered: "Đã giao hàng",
  not_meet_customer: "Không gặp được khách",
  waiting_for_return: "Chờ hoàn hàng",
  returned: "Đã hoàn hàng",
  cancelled: "Đã hủy đơn"
});

export const NhattinDeliveryStatus = Object.freeze({
  take_order_from_vendor: 3,
  transiting: 15
});
