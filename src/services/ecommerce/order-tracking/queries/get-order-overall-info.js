export async function getOrderOverallInfo(db, orderId) {
  return await db.$queryRaw`
    SELECT 
      o.id AS order_id,
      o.order_number AS order_number,
      o.cancel_reason,
      o.shipping_address_name,
      o.shipping_address_phone,
      o.shipping_address_city,
      o.shipping_address_district,
      o.shipping_address_ward,
      o.shipping_address_province,
      o.gateway AS payment_method,
      o.confirmed_status,
      o.cancelled_at,
      o.total_price::numeric,
      o.note,
      (o.shipping_lines->0->>'price')::numeric AS shipping_fee,
      o.confirmed_at AS order_date,
      o.confirmed_at AS payment_date,
      o.closed_at AS completed_date,
      o.cancelled_status,
      o.fulfillment_status,
      json_agg(json_build_object(
        'product_id', ln.product_id::text,
        'title', ln.title,
        'name', ln.name,
        'variant_title', ln.variant_title,
        'quantity', ln.quantity,
        'original_price', ln.price_original,
        'price', ln.price,
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
      o.shipping_address_city,
      o.shipping_address_district,
      o.shipping_address_ward,
      o.shipping_address_province,
      o.gateway,
      o.confirmed_status,
      o.total_price,
      o.note,
      o.shipping_lines,
      o.confirmed_at,
      o.closed_at,
      o.cancelled_at,
      o.fulfillment_status,
      o.cancelled_status
  `;
}
