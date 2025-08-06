import GetOrderStatusesList from "src/services/ecommerce/order/utils/get-order-status.js";

class OrderFormatter {
  constructor(orderId, row, env = null) {
    this.orderId = orderId;
    this.row = row;
    this.env = env;
    if (env) {
      this.getOrderStatusesList = new GetOrderStatusesList(env);
    }
  }

  async format() {
    let order_statuses;
    
    // Try to get external order statuses if env is available
    if (this.env && this.getOrderStatusesList) {
      try {
        order_statuses = await this.getOrderStatusesList.getOrderTimeline(this.orderId);
      } catch (error) {
        console.warn("Failed to fetch external order statuses, using fallback:", error);
      }
    } else {
      // Use local fulfillment statuses as fallback
      order_statuses = this.getFulfillmentStatuses();
    }
    
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
      overall_status: order_statuses.find(status => status.status === "ongoing")?.title || null
    };
  }
}

export async function formatOrderResult(orderId, row, env = null) {
  const formatter = new OrderFormatter(orderId, row, env);
  return await formatter.format();
}
