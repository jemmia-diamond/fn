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
        SELECT id, ref_order_id, order_number, created_at, financial_status, order_processing_status
        FROM haravan.orders
        WHERE id = ${orderId}
        UNION ALL
        SELECT o.id, o.ref_order_id, o.order_number, o.created_at, o.financial_status, o.order_processing_status
        FROM haravan.orders o
            INNER JOIN order_chain oc ON o.id = oc.ref_order_id
    )
    SELECT
        id,
        order_number,
        created_at,
        financial_status,
        order_processing_status
    FROM order_chain
  `;

  if (!includeSelf) {
    sql += `\nWHERE id != ${orderId}`;
  }

  sql += "\nORDER BY created_at ASC";

  return await db.$queryRaw`${Prisma.raw(sql)}`;
}

export async function getRefOrderChains(db, orderIds, includeSelf = false) {
  if (!orderIds || orderIds.length === 0) {
    return {};
  }

  const sql = `
    WITH RECURSIVE order_chain AS (
      SELECT id, ref_order_id, order_number, created_at, financial_status, order_processing_status, id AS root_id
      FROM haravan.orders
      WHERE id IN (${orderIds.join(",")})
      UNION ALL
      SELECT
        o.id, o.ref_order_id, o.order_number, o.created_at, o.financial_status, o.order_processing_status,
        oc.root_id
      FROM haravan.orders o
      INNER JOIN order_chain oc ON o.id = oc.ref_order_id
    )
    SELECT
      root_id, id, order_number, created_at, financial_status, order_processing_status
    FROM order_chain
    ORDER BY root_id, created_at ASC
  `;

  const flatResults = await db.$queryRaw`${Prisma.raw(sql)}`;
  const chains = flatResults.reduce((acc, order) => {
    const { root_id, ...rest } = order;
    if (!acc[root_id]) {
      acc[root_id] = [];
    }

    if (includeSelf || root_id !== order.id) {
      acc[root_id].push(rest);
    }
    return acc;
  }, {});

  for (const key in chains) {
    if (chains[key].length === 0) {
      delete chains[key];
    }
  }
  return chains;
}
