import { Prisma } from "@prisma-cli";

export function buildFilterString(jsonParams) {
  const filterClauses = [];

  if (jsonParams.shapes && jsonParams.shapes.length > 0) {
    filterClauses.push(Prisma.sql`AND d.shape = ANY(${jsonParams.shapes})\n`);
  }

  if (jsonParams.colors && jsonParams.colors.length > 0) {
    filterClauses.push(Prisma.sql`AND d.color = ANY(${jsonParams.colors})\n`);
  }

  if (jsonParams.clarities && jsonParams.clarities.length > 0) {
    filterClauses.push(
      Prisma.sql`AND d.clarity = ANY(${jsonParams.clarities})\n`
    );
  }

  if (jsonParams.fluorescence && jsonParams.fluorescence.length > 0) {
    filterClauses.push(
      Prisma.sql`AND d.fluorescence = ANY(${jsonParams.fluorescence})\n`
    );
  }

  const discountedPriceExpression = Prisma.sql`
    (
        CASE
          WHEN COALESCE(discount_info.max_discount, 0) > 0 THEN ROUND(d.price * (100 - discount_info.max_discount) / 100, 2)
          ELSE d.price
        END
      )
  `;

  if (jsonParams.price?.min) {
    filterClauses.push(
      Prisma.sql`AND ${discountedPriceExpression} >= ${parseFloat(jsonParams.price.min)}\n`
    );
  }

  if (jsonParams.price?.max) {
    filterClauses.push(
      Prisma.sql`AND ${discountedPriceExpression} <= ${parseFloat(jsonParams.price.max)}\n`
    );
  }

  if (jsonParams.edge_size?.lower) {
    filterClauses.push(
      Prisma.sql`AND d.edge_size_2 >= ${parseFloat(jsonParams.edge_size.lower)}\n`
    );
  }

  if (jsonParams.edge_size?.upper) {
    filterClauses.push(
      Prisma.sql`AND d.edge_size_2 <= ${parseFloat(jsonParams.edge_size.upper)}\n`
    );
  }

  if (
    jsonParams.linked_collections &&
    jsonParams.linked_collections.length > 0
  ) {
    filterClauses.push(Prisma.sql`
        AND NOT EXISTS (
          SELECT 1
          FROM workplace.diamonds_haravan_collection m
          JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
          WHERE m.diamond_id = d.id
            AND hc.title = ANY(${jsonParams.linked_collections})
            AND hc.is_excluded = true
        )

        AND (
          NOT EXISTS (
            SELECT 1
            FROM workplace.haravan_collections hc2
            WHERE hc2.title = ANY(${jsonParams.linked_collections})
              AND hc2.is_excluded = false
          )
          OR
          EXISTS (
            SELECT 1
            FROM workplace.diamonds_haravan_collection m2
            JOIN workplace.haravan_collections hc3 ON m2.haravan_collection_id = hc3.id
            WHERE m2.diamond_id = d.id
              AND hc3.title = ANY(${jsonParams.linked_collections})
              AND hc3.is_excluded = false
          )
        )
      \n
    `);
  }

  return filterClauses.length > 0
    ? Prisma.join(filterClauses, " ")
    : Prisma.empty;
}

export function buildSortString(jsonParams) {
  if (jsonParams.sort?.by) {
    const column = jsonParams.sort.by;
    const order =
      jsonParams.sort.order?.toUpperCase() === "ASC"
        ? Prisma.sql`ASC`
        : Prisma.sql`DESC`;
    const validColumns = ["price", "color", "clarity", "shape", "fluorescence"];
    if (validColumns.includes(column)) {
      if (column === "price") {
        return Prisma.sql`
          ORDER BY (
                              CASE
                                WHEN COALESCE(discount_info.max_discount, 0) > 0 THEN ROUND(d.price * (100 - discount_info.max_discount) / 100, 2)
                                ELSE d.price
                              END
                            ) ${order}\n
        `;
      }
      return Prisma.sql`ORDER BY d.${Prisma.raw(column)} ${order}\n`;
    }
  }
  return Prisma.sql`ORDER BY d.variant_id DESC\n`;
}

export function buildPaginationString(jsonParams) {
  if (jsonParams.pagination) {
    const limit = parseInt(jsonParams.pagination.limit, 10);
    const from = parseInt(jsonParams.pagination.from, 10);
    if (!isNaN(limit) && limit > 0) {
      if (!isNaN(from) && from > 1) {
        return Prisma.sql`LIMIT ${limit} OFFSET ${from - 1}\n`;
      }
      return Prisma.sql`LIMIT ${limit}\n`;
    }
  }
  return Prisma.empty;
}

export function buildGetDiamondsQuery(jsonParams) {
  const EXCLUDED_COLLECTION_IDS = [25, 26, 27, 29];

  const filterString = buildFilterString(jsonParams);
  const sortString = buildSortString(jsonParams);
  const paginationString = buildPaginationString(jsonParams);

  const availabilityJoin = Prisma.sql`
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

  const discountJoin = Prisma.sql`
    LEFT JOIN (
      SELECT m.diamond_id, MAX(CAST(hc.discount_value AS NUMERIC)) as max_discount
      FROM workplace.diamonds_haravan_collection m
      JOIN workplace.haravan_collections hc ON m.haravan_collection_id = hc.id
      WHERE hc.discount_type IS NOT NULL AND hc.discount_type <> ''
      GROUP BY m.diamond_id
    ) discount_info ON discount_info.diamond_id = d.id
  `;

  const excludedCollectionCondition = Prisma.sql`
    AND NOT EXISTS (
      SELECT 1
      FROM workplace.diamonds_haravan_collection dhc
      WHERE dhc.diamond_id = d.id
        AND dhc.haravan_collection_id = ANY(ARRAY[${Prisma.join(EXCLUDED_COLLECTION_IDS, ", ")}]::int[])
    )
  `;

  const extraFieldsSelection = jsonParams.extraFields?.includes("sku")
    ? Prisma.sql`,\n      hv.sku`
    : Prisma.empty;

  const dataSql = Prisma.sql`
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
      ) AS images${extraFieldsSelection}
    FROM workplace.diamonds d
    JOIN haravan.products p ON p.id = d.product_id AND p.published_scope IN ('web', 'global')
    ${availabilityJoin}
    ${discountJoin}
    WHERE 1 = 1
    AND JSONB_ARRAY_LENGTH(COALESCE(p.variants, '[]'::jsonb)) = 1
    ${filterString}
    ${excludedCollectionCondition}
    ${sortString}
    ${paginationString}
  `;

  const countSql = Prisma.sql`
    SELECT COUNT(*) AS total
    FROM workplace.diamonds d
    JOIN haravan.products p ON p.id = d.product_id AND p.published_scope IN ('web', 'global')
    ${availabilityJoin}
    ${discountJoin}
    WHERE 1 = 1
    AND JSONB_ARRAY_LENGTH(COALESCE(p.variants, '[]'::jsonb)) = 1
    ${excludedCollectionCondition}
    ${filterString}
  `;

  return { dataSql, countSql };
}
