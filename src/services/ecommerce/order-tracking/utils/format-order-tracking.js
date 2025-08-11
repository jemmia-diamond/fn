class OrderTrackingFormatter {

  async format(orderId, row) {
    return {
      order_id: orderId.toString(),
      total_price: Number(row.total_price || 0),
      subtotal_price: Number(row.subtotal_price || 0),
      shipping_fee: Number(row.shipping_fee || 0),
      discount: Number(row.discount || 0),
      order_details: {
        items: row.items || []
      },
      expected_date: null,
      shipping_type: null,
      receiver: {
        name: row.receiver_name,
        phone: row.receiver_phone,
        address: row.receiver_address
      },
      payment_method: row.payment_method,
      order_date: row.order_date,
      payment_date: null,
      completed_date: null,
      note: row.note,
      cancel_reason: row.cancel_reason,
      overall_status: null
    };
  }
}

export async function formatOrderResult(orderId, row) {
  const formatter = new OrderTrackingFormatter();
  return await formatter.format(orderId, row);
}
