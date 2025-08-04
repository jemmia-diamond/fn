const FulfillmentStatus  = require("../enums/fulfillment-status.enums");
const CancelStatus  = require("../enums/cancel-status.enums");

class OrderFormatter {
  constructor(orderId, row) {
    this.orderId = orderId;
    this.row = row;
  }

  getFulfillmentStatuses() {
    const status = [];

    const fulfillmentStatus = this.row.fulfillment_status;
    const cancelStatus = this.row.cancelled_status;  

    status.push({
      title: "Chưa giao hàng",
      time: "",
      status: fulfillmentStatus === FulfillmentStatus.FULFILLED ? "done" : "current",
      link: ""
    });

    status.push({
      title: "Đã giao hàng",
      time: "",
      status: fulfillmentStatus === FulfillmentStatus.FULFILLED ? "current" : "upcoming",
      link: ""
    });

    // Adding cancel status
    if (cancelStatus === CancelStatus.CANCELED) {
      status.push({
        title: "Đã hủy",
        time: this.row.cancel_at || "",
        status: "current",
        link: ""
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
        items: this.row.items || []
      },
      order_statuses: this.getFulfillmentStatuses(),
      expected_date: "",
      shipping_type: "",
      receiver: {
        name: this.row.receiver_name || "",
        phone: this.row.receiver_phone || "",
        address: this.row.receiver_address || ""
      },
      payment_method: this.row.payment_method || "",
      order_date: this.row.order_date || "",
      payment_date: "",
      completed_date: "",
      note: this.row.note || "",
      cancel_reason: this.row.cancel_reason || ""
    };
  }
}

export function formatOrderResult(orderId, row) {
  const formatter = new OrderFormatter(orderId, row);
  return formatter.format();
}
