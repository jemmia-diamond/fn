export async function getOrderOverallInfo(db, orderId) {
  return await db.$queryRaw`
    SELECT 
      o.id AS order_id,
      o.cancel_reason,
      o.shipping_address_name AS receiver_name,
      o.shipping_address_phone AS receiver_phone,
      o.customer_default_address_address1 AS receiver_address,
      o.gateway AS payment_method,
      o.confirmed_status,
      o.cancelled_at,
      o.subtotal_price::numeric,
      o.total_price::numeric,
      o.total_discounts::numeric AS discount,
      o.note,
      (o.shipping_lines->0->>'price')::numeric AS shipping_fee,
      o.confirmed_at AS order_date,
      o.confirmed_at AS payment_date,
      o.closed_at AS completed_date,
      o.cancelled_status,
      o.fulfillment_status,
      json_agg(json_build_object(
        'product_id', ln.product_id::text,
        'name', ln.name,
        'variant', ln.variant_title,
        'quantity', ln.quantity,
        'original_price', ln.price_original,
        'discount_price', ln.price_promotion,
        'image_url', ln.image->>'src'
      )) AS items
    FROM haravan.orders o
    LEFT JOIN haravan.line_items ln ON o.id = ln.order_id
    WHERE o.id = ${orderId}
    GROUP BY 
      o.id,
      o.cancel_reason,
      o.shipping_address_name,
      o.shipping_address_phone,
      o.customer_default_address_address1,
      o.gateway,
      o.confirmed_status,
      o.subtotal_price,
      o.total_price,
      o.total_discounts,
      o.note,
      o.shipping_lines,
      o.confirmed_at,
      o.closed_at,
      o.cancelled_at,
      o.fulfillment_status,
      o.cancelled_status
  `;
}
