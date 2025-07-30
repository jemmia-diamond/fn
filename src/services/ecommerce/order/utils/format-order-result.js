class OrderFormatter {
  constructor(orderId, row) {
    this.orderId = orderId;
    this.row = row;
  }

  getFulfillmentStatuses() {
    const status = [];

    const isFulfilled = this.row.fulfillment_status;
    const isCanceled = this.row.cancel_status;

    // Giao hàng
    status.push({
      title: "Chưa giao hàng",
      time: "",
      status: isFulfilled ? "done" : "current",
      link: "",
    });

    status.push({
      title: "Đã giao hàng",
      time: "",
      status: isFulfilled ? "current" : "upcoming",
      link: "",
    });

    // Đã hủy (nếu có)
    if (isCanceled) {
      status.push({
        title: "Đã hủy",
        time: this.row.cancel_at || "",
        status: "current",
        link: "",
      });
    }

    return status;
  }

  format() {
    return {
      order_id: this.orderId.toString(),
      status:
        this.row.fulfillment_status === "fulfilled"
          ? "Đã giao hàng"
          : "Chưa giao hàng",
      total_price: Number(this.row.total_price || 0),
      subtotal_price: Number(this.row.subtotal_price || 0),
      shipping_fee: Number(this.row.shipping_fee || 0),
      discount: Number(this.row.discount || 0),
      order_details: {
        items: this.row.items || [],
      },
      order_statuses: this.getFulfillmentStatuses(),
      expected_date: "",
      shipping_type: "",
      receiver: {
        name: this.row.receiver_name || "",
        phone: this.row.receiver_phone || "",
        address: this.row.receiver_address || "",
      },
      payment_method: this.row.payment_method || "",
      order_date: this.row.order_date || "",
      payment_date: "",
      completed_date: "",
      note: this.row.note || "",
      cancel_reason: this.row.cancel_reason || "",
    };
  }
}

export function formatOrderResult(orderId, row) {
  const formatter = new OrderFormatter(orderId, row);
  return formatter.format();
}
