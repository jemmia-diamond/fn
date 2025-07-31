export function getLastOrderIdQuery(orderId) {
  return `
    WITH RECURSIVE order_chain AS (
      SELECT id, ref_order_id, 1 AS depth
      FROM haravan.orders
      WHERE id = '${orderId}'

      UNION ALL

      SELECT o.id, o.ref_order_id, oc.depth + 1
      FROM haravan.orders o
      JOIN order_chain oc ON o.ref_order_id = oc.id
    )
    SELECT id
    FROM order_chain
    ORDER BY depth DESC
    LIMIT 1;
  `;
}
