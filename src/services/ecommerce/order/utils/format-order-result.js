export function formatOrderResult(orderId, row) {
  return {
    order_id: orderId,
    total_price: Number(row.total_price),
    subtotal_price: Number(row.subtotal_price),
    shipping_fee: Number(row.shipping_fee),
    discount: Number(row.discount),
    order_details: {
      items: row.items || []
    },
    status: "",
    order_statuses: [],
    expected_date: "",
    shipping_type: "",
    receiver: {
      name: row.receiver_name,
      phone: row.receiver_phone,
      address: row.receiver_address
    },
    payment_method: row.payment_method,
    order_date: row.order_date,
    payment_date: "",
    completed_date: "",
    note: row.note,
    cancel_reason: row.cancel_reason || ""
  };
}
