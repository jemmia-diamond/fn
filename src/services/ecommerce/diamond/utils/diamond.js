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

  const discountedPriceExpression = "(CASE WHEN promotions ILIKE '%8%%' THEN ROUND(price * 0.92, 2) ELSE price END)";

  if (jsonParams.price?.min) {
    filterString += `AND ${discountedPriceExpression} >= ${parseFloat(jsonParams.price.min)}\n`;
  }

  if (jsonParams.price?.max) {
    filterString += `AND ${discountedPriceExpression} <= ${parseFloat(jsonParams.price.max)}\n`;
  }

  if (jsonParams.edge_size?.lower) {
    filterString += `AND edge_size_2 >= ${parseFloat(jsonParams.edge_size.lower)}\n`;
  }

  if (jsonParams.edge_size?.upper) {
    filterString += `AND edge_size_2 <= ${parseFloat(jsonParams.edge_size.upper)}\n`;
  }

  if (jsonParams.linked_collections && jsonParams.linked_collections.length > 0) {
    const collectionNames = jsonParams.linked_collections.map(f => escapeSingleQuotes(f)).join("','");
    if (collectionNames) {
      filterString += `
        AND NOT EXISTS (
          SELECT 1
          FROM workplace._nc_m2m_diamonds_haravan_collect m
          JOIN workplace.haravan_collections hc ON m.haravan_collections_id = hc.id
          WHERE m.diamonds_id = d.id
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
            FROM workplace._nc_m2m_diamonds_haravan_collect m2
            JOIN workplace.haravan_collections hc3 ON m2.haravan_collections_id = hc3.id
            WHERE m2.diamonds_id = d.id
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
        const discountedPriceExpression = "(CASE WHEN promotions ILIKE '%8%%' THEN ROUND(price * 0.92, 2) ELSE price END)";
        return `ORDER BY ${discountedPriceExpression} ${order}\n`;
      }
      return `ORDER BY ${column} ${order}\n`;
    }
  }
  return "ORDER BY variant_id DESC\n";
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
  const filterString = buildFilterString(jsonParams);
  const sortString = buildSortString(jsonParams);
  const paginationString = buildPaginationString(jsonParams);

  const availabilityFilter = `
    AND EXISTS (
      SELECT 1
      FROM haravan.variants hv
      WHERE hv.id = d.variant_id
        AND hv.qty_available > 0
        AND hv.title LIKE 'GIA%'
    )
    AND EXISTS (
      SELECT 1
      FROM haravan.warehouse_inventories hwi
      JOIN haravan.warehouses hw ON hwi.loc_id = hw.id
      WHERE hwi.variant_id = d.variant_id
        AND hwi.qty_available > 0
        AND hw.name IN (
          '[HCM] Cửa Hàng HCM',
          '[HN] Cửa Hàng HN',
          '[CT] Cửa Hàng Cần Thơ'
        )
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
      CAST(CASE
        WHEN d.promotions ILIKE '%8%%' THEN ROUND(d.price * 0.92, 2)
        ELSE d.price
      END AS DOUBLE PRECISION) AS price,
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
      ) AS images
    FROM workplace.diamonds d
    JOIN haravan.products p ON p.id = d.product_id
    WHERE 1 = 1
    AND jsonb_array_length(p.variants) = 1
    ${availabilityFilter}
    ${filterString}
    ${sortString}
    ${paginationString}
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM workplace.diamonds d
    JOIN haravan.products p ON p.id = d.product_id
    WHERE 1 = 1
    AND jsonb_array_length(p.variants) = 1
    ${availabilityFilter}
    ${filterString}
  `;

  return { dataSql, countSql };
}
