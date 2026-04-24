import { Prisma } from "@prisma-cli";

export function buildStockTrackerQuery(targets, warehouseNames) {
  const valuesSql = [];
  targets.forEach((t, index) => {
    const s1 = t.s1 != null ? parseFloat(t.s1) : null;
    const s2 = t.s2 != null ? parseFloat(t.s2) : null;
    const price =
      t.original_price != null ? parseFloat(t.original_price) : null;
    let c_gte = null,
      c_lte = null,
      c_gt = null,
      c_lt = null;
    if (typeof t.carat === "number") {
      c_gte = t.carat;
      c_lte = t.carat;
    } else if (t.carat && typeof t.carat === "object") {
      c_gte = t.carat.gte != null ? parseFloat(t.carat.gte) : null;
      c_lte = t.carat.lte != null ? parseFloat(t.carat.lte) : null;
      c_gt = t.carat.gt != null ? parseFloat(t.carat.gt) : null;
      c_lt = t.carat.lt != null ? parseFloat(t.carat.lt) : null;
    }
    const color = t.color || null;
    const clarity = t.clarity || null;
    const fluorescence = t.fluorescence || null;

    if (index === 0) {
      valuesSql.push(
        Prisma.sql`(${index + 1}::int, ${s1}::real, ${s2}::real, ${c_gte}::real, ${c_lte}::real, ${c_gt}::real, ${c_lt}::real, ${color}::text, ${clarity}::text, ${fluorescence}::text, ${price}::numeric)`
      );
    } else {
      valuesSql.push(
        Prisma.sql`(${index + 1}, ${s1}, ${s2}, ${c_gte}, ${c_lte}, ${c_gt}, ${c_lt}, ${color}, ${clarity}, ${fluorescence}, ${price})`
      );
    }
  });

  const warehouseFilter =
    warehouseNames && warehouseNames.length > 0
      ? Prisma.sql`WHERE hw.name = ANY(${warehouseNames})`
      : Prisma.empty;

  return Prisma.sql`
    WITH TargetConditions AS (
      SELECT 
        MIN(target_index) as target_index,
        s1, s2, c_gte, c_lte, c_gt, c_lt, col, clar, fluorescence, orig_price
      FROM (VALUES
        ${Prisma.join(valuesSql, ", ")}
      ) AS t(target_index, s1, s2, c_gte, c_lte, c_gt, c_lt, col, clar, fluorescence, orig_price)
      GROUP BY s1, s2, c_gte, c_lte, c_gt, c_lt, col, clar, fluorescence, orig_price
    ),
    RetailInventoryStatus AS (
      SELECT 
        hwi.variant_id,
        SUM(hwi.qty_available) as retail_stock
      FROM haravan.warehouse_inventories hwi
      JOIN haravan.warehouses hw ON hwi.loc_id = hw.id
      ${warehouseFilter}
      GROUP BY hwi.variant_id
    ),
    ActiveOrderItems AS (
      SELECT DISTINCT ON (ln.variant_id) 
        ln.variant_id, 
        o.order_number,
        o.created_at AS order_date
      FROM haravan.line_items ln
      JOIN haravan.orders o ON ln.order_id = o.id
      WHERE o.cancelled_at IS NULL
      ORDER BY ln.variant_id, o.created_at DESC
    ),
    ActiveTempOrderItems AS (
      SELECT DISTINCT ON (tp.gia_report_no) 
        tp.gia_report_no, 
        o.order_number,
        o.created_at AS order_date
      FROM haravan.line_items ln
      JOIN haravan.orders o ON ln.order_id = o.id
      JOIN workplace.temporary_products tp ON ln.variant_id::text = tp.haravan_variant_id::text
      WHERE o.cancelled_at IS NULL
      ORDER BY tp.gia_report_no, o.created_at DESC
    )
    SELECT * FROM (
      SELECT
        tc.target_index,
        d.id,
        CAST(d.product_id AS INT) AS product_id,
      CAST(d.variant_id AS INT) AS variant_id,
      hv.sku,
      d.report_no,
      d.edge_size_1,
      d.edge_size_2,
      d.edge_size_1 || ' x ' || d.edge_size_2 AS size,
      d.carat,
      d.color,
      d.clarity,
      d.fluorescence,
      CAST(d.price AS DOUBLE PRECISION) AS base_price,
      CAST(
        CASE
          WHEN COALESCE(discount_info.max_discount, 0) > 0 
          THEN ROUND(d.price * (100 - discount_info.max_discount) / 100, 2)
          ELSE d.price
        END
      AS DOUBLE PRECISION) AS current_price,
      CAST(COALESCE(inv.retail_stock, 0) AS INT) AS total_stock,
      CASE 
        WHEN COALESCE(inv.retail_stock, 0) > 0 THEN 'Chưa bán'
        WHEN aoi.order_number IS NOT NULL THEN 'Đã bán'
        WHEN atoi.order_number IS NOT NULL THEN 'Đặt trước'
        ELSE 'Không có hàng'
      END AS sale_status,
      CASE 
        WHEN COALESCE(inv.retail_stock, 0) > 0 THEN NULL
        WHEN aoi.order_number IS NOT NULL THEN aoi.order_number
        WHEN atoi.order_number IS NOT NULL THEN atoi.order_number
        ELSE NULL
      END AS in_order,
      CASE 
        WHEN COALESCE(inv.retail_stock, 0) > 0 THEN NULL
        WHEN aoi.order_date IS NOT NULL THEN aoi.order_date
        WHEN atoi.order_date IS NOT NULL THEN atoi.order_date
        ELSE NULL
      END AS order_date,
      discount_info.title AS active_collection
    FROM workplace.diamonds d
    JOIN haravan.variants hv ON hv.id = d.variant_id
    JOIN TargetConditions tc ON (
      (tc.s1 IS NULL OR TRUNC(d.edge_size_1::numeric, 1) = TRUNC(tc.s1::numeric, 1))
      AND (tc.s2 IS NULL OR TRUNC(d.edge_size_2::numeric, 1) = TRUNC(tc.s2::numeric, 1))
      AND (tc.c_gte IS NULL OR d.carat >= tc.c_gte)
      AND (tc.c_lte IS NULL OR d.carat <= tc.c_lte)
      AND (tc.c_gt IS NULL OR d.carat > tc.c_gt)
      AND (tc.c_lt IS NULL OR d.carat < tc.c_lt)
      AND (tc.col IS NULL OR d.color = tc.col)
      AND (tc.clar IS NULL OR d.clarity = tc.clar)
      AND (tc.fluorescence IS NULL OR d.fluorescence = tc.fluorescence)
      AND (tc.orig_price IS NULL OR d.price = tc.orig_price)
    )
    LEFT JOIN RetailInventoryStatus inv ON inv.variant_id = d.variant_id
    LEFT JOIN ActiveOrderItems aoi ON aoi.variant_id = d.variant_id
    LEFT JOIN ActiveTempOrderItems atoi ON (atoi.gia_report_no::text = d.report_no::text OR atoi.gia_report_no::text = 'GIA' || d.report_no::text)
    LEFT JOIN (
      SELECT DISTINCT ON (m.diamond_id)
        m.diamond_id,
        CAST(hc.discount_value AS NUMERIC) as max_discount,
        hc.title
      FROM workplace.diamonds_haravan_collection m
      JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
      WHERE hc.discount_type = 'percent'
      ORDER BY m.diamond_id, CAST(hc.discount_value AS NUMERIC) DESC
    ) discount_info ON discount_info.diamond_id = d.id
      WHERE d.auto_create_haravan_product = true
        AND hv.sku LIKE '%-GIA%'
    ) AS results
    WHERE order_date >= '2026-03-01' OR order_date IS NULL
    ORDER BY target_index ASC, order_date DESC NULLS LAST, edge_size_1 DESC, color ASC, clarity ASC;
  `;
}
