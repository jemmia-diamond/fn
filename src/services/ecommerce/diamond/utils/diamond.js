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

  const discountedPriceExpression = "(CASE WHEN promotions ILIKE '%8%%' THEN ROUND(price * 0.92, 2) ELSE price END)";

  if (jsonParams.price?.min) {
    filterString += `AND ${discountedPriceExpression} >= ${parseFloat(jsonParams.price.min)}\n`;
  }

  if (jsonParams.price?.max) {
    filterString += `AND ${discountedPriceExpression} <= ${parseFloat(jsonParams.price.max)}\n`;
  }

  return filterString;
}

function buildSortString(jsonParams) {
  if (jsonParams.sort?.by) {
    const column = jsonParams.sort.by;
    const order = jsonParams.sort.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const validColumns = ["price", "color", "clarity", "shape"];
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
      WHERE hv.id = workplace.diamonds.variant_id
        AND hv.qty_available > 0
        AND hv.title LIKE 'GIA%'
    )
    AND EXISTS (
      SELECT 1
      FROM haravan.warehouse_inventories hwi
      JOIN haravan.warehouses hw ON hwi.loc_id = hw.id
      WHERE hwi.variant_id = workplace.diamonds.variant_id
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
      CAST(product_id AS INT) AS product_id,
      CAST(variant_id AS INT) AS variant_id,
      report_no,
      shape,
      CAST(carat AS DOUBLE PRECISION) AS carat,
      color,
      clarity,
      cut,
      edge_size_1, edge_size_2, CAST(price AS DOUBLE PRECISION) as compare_at_price,
      CAST(CASE
        WHEN promotions ILIKE '%8%%' THEN ROUND(price * 0.92, 2)
        ELSE price
      END AS DOUBLE PRECISION) AS price
    FROM workplace.diamonds
    WHERE 1 = 1
    ${availabilityFilter}
    ${filterString}
    ${sortString}
    ${paginationString}
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM workplace.diamonds
    WHERE 1 = 1
    ${availabilityFilter}
    ${filterString}
  `;

  return { dataSql, countSql };
}
