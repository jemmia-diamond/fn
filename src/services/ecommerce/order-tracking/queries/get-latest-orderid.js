export async function getLatestOrderId(db, orderId) {
  const latestOrderRows = await db.$queryRaw`
    WITH RECURSIVE order_chain AS (
        SELECT id, ref_order_id
        FROM haravan.orders
        WHERE id = ${orderId}

        UNION ALL

        SELECT o.id, o.ref_order_id
        FROM haravan.orders o
        JOIN order_chain oc ON o.ref_order_id = oc.id
        WHERE oc.ref_order_id IS NOT NULL
    )
    SELECT id
    FROM order_chain
    WHERE ref_order_id IS NULL;
  `;

  const latestOrderId = latestOrderRows.length
    ? latestOrderRows[0].id
    : orderId;
  return latestOrderId;
}
