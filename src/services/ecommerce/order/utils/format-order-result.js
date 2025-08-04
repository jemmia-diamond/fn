import { FulfillmentStatus } from "src/services/ecommerce/order/enums/fulfillment-status.enum.js";
import { CancelStatus } from "src/services/ecommerce/order/enums/cancel-status.enum.js";
import { OrderTimelineStatus } from "src/services/ecommerce/order/enums/order-step-status.enum.js";
import { OrderOverallStatus } from "src/services/ecommerce/order/enums/order-overall-status.enum.js";

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
      title: OrderOverallStatus.UNFULFILLED,
      time: null,
      status: fulfillmentStatus === FulfillmentStatus.FULFILLED ? OrderTimelineStatus.PAST : OrderTimelineStatus.ONGOING,
      link: null
    });

    order_statuses.push({
      title: OrderOverallStatus.FULFILLED,
      time: null,
      status: fulfillmentStatus === FulfillmentStatus.FULFILLED ? OrderTimelineStatus.ONGOING : OrderTimelineStatus.UPCOMING,
      link: null
    });

    // Adding cancel status
    if (cancelStatus === CancelStatus.CANCELLED) {
      order_statuses.push({
        title: OrderOverallStatus.CANCELLED,
        time: this.row.cancel_at,
        status: OrderTimelineStatus.CANCELLED,
        link: null
      });
    }

    return order_statuses;
  }

  format() {
    const order_statuses = this.getFulfillmentStatuses();
    
    return {
      order_id: this.orderId.toString(),
      total_price: Number(this.row.total_price || 0),
      subtotal_price: Number(this.row.subtotal_price || 0),
      shipping_fee: Number(this.row.shipping_fee || 0),
      discount: Number(this.row.discount || 0),
      order_details: {
        items: this.row.items || []
      },
      order_statuses: order_statuses,
      expected_date: null,
      shipping_type: null,
      receiver: {
        name: this.row.receiver_name || null,
        phone: this.row.receiver_phone || null,
        address: this.row.receiver_address || null
      },
      payment_method: this.row.payment_method,
      order_date: this.row.order_date || null,
      payment_date: null,
      completed_date: null,
      note: this.row.note || null,
      cancel_reason: this.row.cancel_reason || null,
      overall_status: order_statuses.find(status => status.status === OrderTimelineStatus.ONGOING).title
    };
  }
}

export function formatOrderResult(orderId, row) {
  const formatter = new OrderFormatter(orderId, row);
  return formatter.format();
}
