function escapeSingleQuotes(value) {
  if (typeof value !== "string") return value;
  return value.replace(/'/g, "''");
}

function buildFilterString(jsonParams) {
  let filterString = "";

  if (jsonParams.shapes && jsonParams.shapes.length > 0) {
    const shapes = jsonParams.shapes.map(s => escapeSingleQuotes(s)).join("','");
    filterString += `AND shape IN ('${shapes}')\n`;
  }

  if (jsonParams.colors && jsonParams.colors.length > 0) {
    const colors = jsonParams.colors.map(c => escapeSingleQuotes(c)).join("','");
    filterString += `AND color IN ('${colors}')\n`;
  }

  if (jsonParams.clarities && jsonParams.clarities.length > 0) {
    const clarities = jsonParams.clarities.map(c => escapeSingleQuotes(c)).join("','");
    filterString += `AND clarity IN ('${clarities}')\n`;
  }

  if (jsonParams.fluorescence && jsonParams.fluorescence.length > 0) {
    const fluorescence = jsonParams.fluorescence.map(f => escapeSingleQuotes(f)).join("','");
    filterString += `AND fluorescence IN ('${fluorescence}')\n`;
  }

  const discountedPriceExpression = `
    (
        CASE
          WHEN COALESCE(discount_info.max_discount, 0) > 0 THEN ROUND(d.price * (100 - discount_info.max_discount) / 100, 2)
          ELSE d.price
        END
      )
  `;

  if (jsonParams.price?.min) {
    filterString += `AND ${discountedPriceExpression} >= ${parseFloat(jsonParams.price.min)}\n`;
  }

  if (jsonParams.price?.max) {
    filterString += `AND ${discountedPriceExpression} <= ${parseFloat(jsonParams.price.max)}\n`;
  }

  if (jsonParams.edge_size?.lower) {
    filterString += `AND d.edge_size_2 >= ${parseFloat(jsonParams.edge_size.lower)}\n`;
  }

  if (jsonParams.edge_size?.upper) {
    filterString += `AND d.edge_size_2 <= ${parseFloat(jsonParams.edge_size.upper)}\n`;
  }

  if (jsonParams.linked_collections && jsonParams.linked_collections.length > 0) {
    const collectionNames = jsonParams.linked_collections.map(f => escapeSingleQuotes(f)).join("','");
    if (collectionNames) {
      filterString += `
        AND NOT EXISTS (
          SELECT 1
          FROM workplace.diamonds_haravan_collection m
          JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
          WHERE m.diamond_id = d.id
            AND hc.title IN ('${collectionNames}')
            AND hc.is_excluded = true
        )

        AND (
          NOT EXISTS (
            SELECT 1
            FROM workplace.haravan_collections hc2
            WHERE hc2.title IN ('${collectionNames}')
              AND hc2.is_excluded = false
          )
          OR
          EXISTS (
            SELECT 1
            FROM workplace.diamonds_haravan_collection m2
            JOIN workplace.haravan_collections hc3 ON m2.haravan_collection_id = hc3.id
            WHERE m2.diamond_id = d.id
              AND hc3.title IN ('${collectionNames}')
              AND hc3.is_excluded = false
          )
        )
      `;
    }
  }

  return filterString;
}

function buildSortString(jsonParams) {
  if (jsonParams.sort?.by) {
    const column = jsonParams.sort.by;
    const order = jsonParams.sort.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const validColumns = ["price", "color", "clarity", "shape", "fluorescence"];
    if (validColumns.includes(column)) {
      if (column === "price") {
        const discountedPriceExpression = `
          (
                    CASE
                      WHEN COALESCE(discount_info.max_discount, 0) > 0 THEN ROUND(d.price * (100 - discount_info.max_discount) / 100, 2)
                      ELSE d.price
                    END
                  )
        `;
        return `ORDER BY ${discountedPriceExpression} ${order}\n`;
      }
      return `ORDER BY d.${column} ${order}\n`;
    }
  }
  return "ORDER BY d.variant_id DESC\n";
}

function buildPaginationString(jsonParams) {
  let paginationString = "";
  if (jsonParams.pagination) {
    const limit = parseInt(jsonParams.pagination.limit, 10);
    const from = parseInt(jsonParams.pagination.from, 10);
    if (!isNaN(limit) && limit > 0) {
      paginationString += `LIMIT ${limit} `;
      if (!isNaN(from) && from > 1) {
        paginationString += `OFFSET ${from - 1}\n`;
      }
    }
  }
  return paginationString;
}

export function buildGetDiamondsQuery(jsonParams) {
  const EXCLUDED_COLLECTION_IDS = [25, 26, 27, 29];

  const filterString = buildFilterString(jsonParams);
  const sortString = buildSortString(jsonParams);
  const paginationString = buildPaginationString(jsonParams);

  const availabilityJoin = `
    JOIN haravan.variants hv ON hv.id = d.variant_id AND hv.qty_available > 0 AND hv.title LIKE 'GIA%' AND hv.published_scope IN ('web', 'global')
    JOIN (
      SELECT hwi.variant_id
      FROM haravan.warehouse_inventories hwi
      JOIN haravan.warehouses hw ON hwi.loc_id = hw.id
      WHERE hw.name IN (
        '[HCM] Cửa Hàng HCM',
        '[HN] Cửa Hàng HN',
        '[CT] Cửa Hàng Cần Thơ'
      )
      GROUP BY hwi.variant_id
      HAVING SUM(hwi.qty_available) > 0
    ) inventory_check ON inventory_check.variant_id = d.variant_id
  `;

  const discountJoin = `
    LEFT JOIN (
      SELECT m.diamond_id, MAX(CAST(hc.discount_value AS NUMERIC)) as max_discount
      FROM workplace.diamonds_haravan_collection m
      JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
      WHERE hc.discount_type IS NOT NULL AND hc.discount_type <> ''
      GROUP BY m.diamond_id
    ) discount_info ON discount_info.diamond_id = d.id
  `;

  const excludedCollectionCondition = `
    AND NOT EXISTS (
      SELECT 1
      FROM workplace.diamonds_haravan_collection dhc
      WHERE dhc.diamond_id = d.id
        AND dhc.haravan_collection_id IN (${EXCLUDED_COLLECTION_IDS.join(", ")})
    )
  `;

  const dataSql = `
    SELECT
      CAST(d.product_id AS INT) AS product_id,
      CAST(d.variant_id AS INT) AS variant_id,
      d.report_no,
      d.shape,
      CAST(d.carat AS DOUBLE PRECISION) AS carat,
      d.color,
      d.clarity,
      d.cut,
      d.fluorescence,
      d.edge_size_1, d.edge_size_2,
      CAST(d.price AS DOUBLE PRECISION) as compare_at_price,
      CAST(
        CASE
          WHEN COALESCE(discount_info.max_discount, 0) > 0 THEN ROUND(d.price * (100 - discount_info.max_discount) / 100, 2)
          ELSE d.price
        END
      AS DOUBLE PRECISION) AS price,
      CAST(d.final_discounted_price AS DOUBLE PRECISION) as final_discounted_price,
      p.handle,
      p.title,
      ARRAY(
        SELECT i.src
        FROM haravan.images i
        WHERE i.product_id = d.product_id
          AND (
            i.variant_ids IS NULL
            OR i.variant_ids = '[]'
            OR d.variant_id = ANY(
              SELECT (jsonb_array_elements_text(i.variant_ids::jsonb))::INT
            )
          )
      ) AS images,
      hv.sku
    FROM workplace.diamonds d
    JOIN haravan.products p ON p.id = d.product_id AND p.published_scope IN ('web', 'global')
    ${availabilityJoin}
    ${discountJoin}
    WHERE 1 = 1
    AND jsonb_array_length(p.variants) = 1
    ${filterString}
    ${excludedCollectionCondition}
    ${sortString}
    ${paginationString}
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM workplace.diamonds d
    JOIN haravan.products p ON p.id = d.product_id AND p.published_scope IN ('web', 'global')
    ${availabilityJoin}
    ${discountJoin}
    WHERE 1 = 1
    AND jsonb_array_length(p.variants) = 1
    ${excludedCollectionCondition}
    ${filterString}
  `;

  return { dataSql, countSql };
}
