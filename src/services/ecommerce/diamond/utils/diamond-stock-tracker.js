export function buildStockTrackerQuery(targets, warehouseNames) {
  const valuesClause = targets.map(t => {
    const s1 = t.s1 != null ? parseFloat(t.s1) : null;
    const s2 = t.s2 != null ? parseFloat(t.s2) : null;
    const price = t.original_price != null ? parseFloat(t.original_price) : null;

    const color = t.color ? `'${t.color.replace(/'/g, "''")}'` : "NULL";
    const clarity = t.clarity ? `'${t.clarity.replace(/'/g, "''")}'` : "NULL";

    return `(${s1 !== null ? `${s1}::real` : "NULL"}, ${s2 !== null ? `${s2}::real` : "NULL"}, ${color}, ${clarity}, ${price !== null ? `${price}::numeric` : "NULL"})`;
  }).join(", ");

  const warehouseNamesList = warehouseNames.map(name => `'${name.replace(/'/g, "''")}'`).join(", ");

  return `
    WITH TargetConditions AS (
      SELECT DISTINCT * FROM (VALUES
        ${valuesClause}
      ) AS t(s1, s2, col, clar, orig_price)
    ),
    RetailInventoryStatus AS (
      SELECT 
        hwi.variant_id,
        SUM(hwi.qty_available) as retail_stock
      FROM haravan.warehouse_inventories hwi
      JOIN haravan.warehouses hw ON hwi.loc_id = hw.id
      ${warehouseNamesList.length > 0 ? `WHERE hw.name IN (${warehouseNamesList})` : ""}
      GROUP BY hwi.variant_id
    ),
    ActiveOrderItems AS (
      SELECT DISTINCT ON (ln.variant_id) 
        ln.variant_id, 
        o.order_number
      FROM haravan.line_items ln
      JOIN haravan.orders o ON ln.order_id = o.id
      WHERE o.cancelled_at IS NULL
      ORDER BY ln.variant_id, o.created_at DESC
    ),
    ActiveTempOrderItems AS (
      SELECT DISTINCT ON (tp.gia_report_no) 
        tp.gia_report_no, 
        o.order_number
      FROM haravan.line_items ln
      JOIN haravan.orders o ON ln.order_id = o.id
      JOIN workplace.temporary_products tp ON ln.variant_id::text = tp.haravan_variant_id::text
      WHERE o.cancelled_at IS NULL
      ORDER BY tp.gia_report_no, o.created_at DESC
    )
    SELECT
      d.id,
      CAST(d.product_id AS INT) AS product_id,
      CAST(d.variant_id AS INT) AS variant_id,
      hv.sku,
      d.report_no,
      d.edge_size_1,
      d.edge_size_2,
      d.edge_size_1 || ' x ' || d.edge_size_2 AS size,
      d.color,
      d.clarity,
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
      discount_info.title AS active_collection
    FROM workplace.diamonds d
    JOIN haravan.variants hv ON hv.id = d.variant_id
    JOIN TargetConditions tc ON (
      (tc.s1 IS NULL OR d.edge_size_1 = tc.s1)
      AND (tc.s2 IS NULL OR d.edge_size_2 = tc.s2)
      AND (tc.col IS NULL OR d.color = tc.col)
      AND (tc.clar IS NULL OR d.clarity = tc.clar)
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
    ORDER BY d.edge_size_1 DESC, d.color ASC, d.clarity ASC;
  `;
}
