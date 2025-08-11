class OrderFormatter {
  constructor(orderId, row) {
    this.orderId = orderId;
    this.row = row;
  }

  async format() {

    return {
      order_id: this.orderId.toString(),
      total_price: Number(this.row.total_price || 0),
      subtotal_price: Number(this.row.subtotal_price || 0),
      shipping_fee: Number(this.row.shipping_fee || 0),
      discount: Number(this.row.discount || 0),
      order_details: {
        items: this.row.items || []
      },
      expected_date: null,
      shipping_type: null,
      receiver: {
        name: this.row.receiver_name,
        phone: this.row.receiver_phone,
        address: this.row.receiver_address
      },
      payment_method: this.row.payment_method,
      order_date: this.row.order_date,
      payment_date: null,
      completed_date: null,
      note: this.row.note,
      cancel_reason: this.row.cancel_reason,
      overall_status: null
    };
  }
}

export async function formatOrderResult(orderId, row) {
  const formatter = new OrderFormatter(orderId, row);
  return await formatter.format();
}
