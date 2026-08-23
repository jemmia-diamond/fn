export async function getLatestOrderId(db, orderId) {
  const latestOrderRows = await db.$queryRaw`
    WITH RECURSIVE order_chain AS (
        SELECT 
            id,
            order_number,
            ref_order_number,
            order_number AS latest_order,
            id AS latest_order_id,
            1 AS level,
            created_at
        FROM haravan.orders 
        WHERE order_number NOT IN (
            SELECT ref_order_number 
            FROM haravan.orders 
            WHERE ref_order_number IS NOT NULL
        )

        UNION ALL

        SELECT 
            o.id,
            o.order_number,
            o.ref_order_number,
            oc.latest_order,
            oc.latest_order_id,  
            oc.level + 1,
            o.created_at
        FROM haravan.orders o
        INNER JOIN order_chain oc ON o.order_number = oc.ref_order_number
    ),
    latest_chain AS (
        SELECT DISTINCT ON (id, order_number) *
        FROM order_chain
    )
    SELECT 
        o.id AS order_id,
        o.order_number AS order_number,
        o.ref_order_id AS ref_order_id,
        o.ref_order_number AS ref_order_number,
        COALESCE(lc.latest_order_id, o.id) AS latest_order_id,
        COALESCE(lc.latest_order, o.order_number) AS latest_order_number
    FROM haravan.orders o 
    LEFT JOIN latest_chain lc ON o.order_number = lc.order_number 
    WHERE o.id = ${orderId};
  `;

  const latestOrderId = latestOrderRows.length
    ? latestOrderRows[0].latest_order_id
    : orderId;
  return latestOrderId;
}
