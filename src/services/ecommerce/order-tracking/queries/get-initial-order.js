import { Prisma } from "@prisma-cli";

export async function getInitialOrder(db, orderId) {
  const orders = await db.$queryRaw`
    WITH RECURSIVE order_chain AS (
        SELECT id, ref_order_id 
        FROM haravan.orders 
        WHERE id = ${orderId}
        UNION ALL 
        SELECT o.id, o.ref_order_id
        FROM haravan.orders o
            INNER JOIN order_chain oc ON o.id = oc.ref_order_id
    )
    SELECT 
    o.id ,
    o.order_number ,
    o.created_at 
    FROM haravan.orders o 
    WHERE o.id IN (
        SELECT id FROM order_chain
    )
    ORDER BY o.created_at ASC 
    LIMIT 1 
  `;

  return orders.length ? orders[0] : null;
}

export async function getRefOrderChain(db, orderId, includeSelf = false) {
  let sql = `
    WITH RECURSIVE order_chain AS (
        SELECT id, ref_order_id, order_number, created_at
        FROM haravan.orders 
        WHERE id = ${orderId}
        UNION ALL 
        SELECT o.id, o.ref_order_id, o.order_number, o.created_at
        FROM haravan.orders o
            INNER JOIN order_chain oc ON o.id = oc.ref_order_id
    )
    SELECT 
        id,
        order_number,
        created_at 
    FROM order_chain
  `;

  if (!includeSelf) {
    sql += `\nWHERE id != ${orderId}`;
  }

  sql += "\nORDER BY created_at ASC";

  return await db.$queryRaw`${Prisma.raw(sql)}`;
}
