const FulfillmentStatus  = require("../enums/fulfillment-status.enum");
const CancelStatus  = require("../enums/cancel-status.enum");
const OrderStepStatus = require("../enums/order-step-status.enum");

class OrderFormatter {
  constructor(orderId, row) {
    this.orderId = orderId;
    this.row = row;
  }

  getFulfillmentStatuses() {
    const order_statuses = [];

    const fulfillmentStatus = this.row.fulfillment_status;
    const cancelStatus = this.row.cancelled_status;  

    order_statuses.push({
      title: "Chưa giao hàng",
      time: "",
      status: fulfillmentStatus === FulfillmentStatus.FULFILLED ? OrderStepStatus.PAST : OrderStepStatus.ONGOING,
      link: ""
    });

    order_statuses.push({
      title: "Đã giao hàng",
      time: "",
      status: fulfillmentStatus === FulfillmentStatus.FULFILLED ? OrderStepStatus.ONGOING : OrderStepStatus.UPCOMING,
      link: ""
    });

    // Adding cancel status
    if (cancelStatus === CancelStatus.CANCELED) {
      order_statuses.push({
        title: "Đã hủy",
        time: this.row.cancel_at || "",
        status: OrderStepStatus.CANCELLED,
        link: ""
      });
    }

    return order_statuses;
  }

  format() {
    return {
      order_id: this.orderId.toString(),
      overall_status:
        this.row.fulfillment_status === FulfillmentStatus.FULFILLED
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
