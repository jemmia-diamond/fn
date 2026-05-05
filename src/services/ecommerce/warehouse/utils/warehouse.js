import { Prisma } from "@prisma-cli";

export function buildQuery(productId) {
  return Prisma.sql`
    SELECT
      wi.variant_id,
      wi.loc_id,
      w.name,
      SUM(wi.qty_available) AS qty_available
    FROM haravan.warehouse_inventories AS wi
    LEFT JOIN haravan.warehouses AS w ON w.id = wi.loc_id
    WHERE wi.product_id = ${productId}
    GROUP BY wi.variant_id, wi.loc_id, w.name
    HAVING SUM(wi.qty_available) > 0;
  `;
}
