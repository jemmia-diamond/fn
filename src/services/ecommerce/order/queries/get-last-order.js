export function getLastOrderIdQuery(db, orderId) {
  return db.$queryRaw`
    WITH RECURSIVE order_chain AS (
      -- Base case: start with the given order ID
      SELECT id, ref_order_id, 1 AS depth
      FROM haravan.orders
      WHERE id = ${orderId}

      UNION ALL

      -- Recursive case: find orders that reference the current order
      SELECT o.id, o.ref_order_id, oc.depth + 1
      FROM haravan.orders o
      JOIN order_chain oc ON o.ref_order_id = oc.id
      WHERE oc.depth < 10  -- Prevent infinite recursion
    )
    SELECT id
    FROM order_chain
    ORDER BY depth DESC
    LIMIT 1;
  `;
}
