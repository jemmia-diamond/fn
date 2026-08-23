import { Prisma } from "@prisma-cli";
import { toSqlOrder } from "services/utils/sql-helpers";

function normalizeStyles(styles) {
  return styles.map((style) => style.trim().toLowerCase());
}

function buildRingStyleFilter(columnName, styles) {
  const normalizedStyles = normalizeStyles(styles);
  const colSql = Prisma.raw(columnName);
  return Prisma.sql`
    AND (
      (${colSql} IS NOT NULL AND ${colSql} != '' AND POSITION(' - ' IN ${colSql}) > 0 AND LOWER(SPLIT_PART(${colSql}, ' - ', 2)) = ANY(${normalizedStyles}))
      OR (${colSql} IS NOT NULL AND ${colSql} != '' AND POSITION(' - ' IN ${colSql}) = 0 AND LOWER(${colSql}) = ANY(${normalizedStyles}))
    )\n
  `;
}

function buildExcludedRingStyleFilter(columnName, styles) {
  const normalizedStyles = normalizeStyles(styles);
  const colSql = Prisma.raw(columnName);
  return Prisma.sql`
    AND (
      ${colSql} IS NULL OR
      ${colSql} = '' OR
      LOWER(
        CASE
          WHEN POSITION(' - ' IN ${colSql}) > 0
          THEN SPLIT_PART(${colSql}, ' - ', 2)
          ELSE ${colSql}
        END
      ) != ALL(${normalizedStyles}::text[])
    )\n
  `;
}

export function aggregateQuery(jsonParams) {
  const filterClauses = [];
  let sortSql = Prisma.empty;
  let paginationSql = Prisma.empty;
  let handleFinenessPriority = "18K";
  let sortedColumn = "p.max_price_18";
  let collectionJoinEcomProductsClause = "";
  let havingSql = Prisma.empty;
  const linkedCollectionJoinEcomProductsClause = "";
  let needsP2Join = false;
  let warehouseJoinClause = "";
  if (jsonParams.is_in_stock) {
    havingSql = Prisma.sql`HAVING SUM(v.qty_available) > 0\n`;
  }

  filterClauses.push(Prisma.sql`AND p.published_scope = 'global'\n`);

  if (jsonParams.categories && jsonParams.categories.length > 0) {
    if (!jsonParams.product_types || jsonParams.product_types.length === 0) {
      filterClauses.push(
        Prisma.sql`AND p.haravan_product_type = ANY(${jsonParams.categories})\n`
      );
    }
  }

  if (jsonParams.pages && jsonParams.pages.length > 0) {
    filterClauses.push(Prisma.sql`AND p2.pages = ANY(${jsonParams.pages})\n`);
    needsP2Join = true;
  }

  if (jsonParams.product_types && jsonParams.product_types.length > 0) {
    filterClauses.push(
      Prisma.sql`AND p.haravan_product_type = ANY(${jsonParams.product_types})\n`
    );
  }

  if (jsonParams.material_colors && jsonParams.material_colors.length > 0) {
    filterClauses.push(
      Prisma.sql`AND v.material_color = ANY(${jsonParams.material_colors})\n`
    );
  }

  if (jsonParams.ring_sizes && jsonParams.ring_sizes.length > 0) {
    filterClauses.push(
      Prisma.sql`AND v.ring_size = ANY(${jsonParams.ring_sizes})\n`
    );
  }

  if (jsonParams.fineness && jsonParams.fineness.length > 0) {
    filterClauses.push(
      Prisma.sql`AND v.fineness = ANY(${jsonParams.fineness})\n`
    );
    if (jsonParams.fineness.includes("Vàng 14K")) {
      sortedColumn = "p.max_price_14";
      handleFinenessPriority = "14K";
    }
  }

  if (jsonParams.price?.min) {
    filterClauses.push(
      Prisma.sql`AND p.min_price >= ${jsonParams.price.min}\n`
    );
  }

  if (jsonParams.price?.max) {
    filterClauses.push(
      Prisma.sql`AND p.max_price <= ${jsonParams.price.max}\n`
    );
  }

  if (jsonParams.genders && jsonParams.genders.length > 0) {
    filterClauses.push(
      Prisma.sql`AND (p.gender = ANY(${jsonParams.genders}) OR p.gender IS NULL OR p.gender = '')\n`
    );
  }

  if (jsonParams.design_tags && jsonParams.design_tags.length > 0) {
    filterClauses.push(
      Prisma.sql`AND p.tag = ANY(${jsonParams.design_tags})\n`
    );
  }

  if (jsonParams.design_ids && jsonParams.design_ids.length > 0) {
    const designIds = jsonParams.design_ids.map((id) => BigInt(id));
    filterClauses.push(Prisma.sql`AND p.design_id = ANY(${designIds})\n`);
  }

  if (
    jsonParams.linked_collections &&
    jsonParams.linked_collections.length > 0
  ) {
    filterClauses.push(Prisma.sql`
      AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(p.collections) AS elem 
            WHERE elem->>'title' = ANY(${jsonParams.linked_collections})
          )\n
    `);
  }

  if (jsonParams.ring_head_styles && jsonParams.ring_head_styles.length > 0) {
    filterClauses.push(
      buildRingStyleFilter("p.ring_head_style", jsonParams.ring_head_styles)
    );
  }

  if (jsonParams.ring_band_styles && jsonParams.ring_band_styles.length > 0) {
    filterClauses.push(
      buildRingStyleFilter("p.ring_band_style", jsonParams.ring_band_styles)
    );
  }

  if (
    jsonParams.excluded_ring_head_styles &&
    jsonParams.excluded_ring_head_styles.length > 0
  ) {
    filterClauses.push(
      buildExcludedRingStyleFilter(
        "p.ring_head_style",
        jsonParams.excluded_ring_head_styles
      )
    );
  }

  if (
    jsonParams.excluded_ring_band_styles &&
    jsonParams.excluded_ring_band_styles.length > 0
  ) {
    filterClauses.push(
      buildExcludedRingStyleFilter(
        "p.ring_band_style",
        jsonParams.excluded_ring_band_styles
      )
    );
  }

  const order = toSqlOrder(jsonParams.sort?.order);

  const sortStrategies = {
    price: () => Prisma.sql`ORDER BY ${Prisma.raw(sortedColumn)} ${order}\n`,
    sold_quantity: () =>
      Prisma.sql`ORDER BY COALESCE(p.sold_quantity, 0) ${order}\n`,
    created_date: () =>
      Prisma.sql`ORDER BY COALESCE(p.created_date, p.database_created_at) ${order}\n`
  };

  if (jsonParams.sort?.by && sortStrategies[jsonParams.sort.by]) {
    sortSql = sortStrategies[jsonParams.sort.by]();
  }

  if (jsonParams.product_ids && jsonParams.product_ids.length > 0) {
    const productIds = jsonParams.product_ids.map((id) =>
      typeof id === "string" ? BigInt(id) : id
    );
    filterClauses.push(
      Prisma.sql`AND p.haravan_product_id = ANY(${productIds})\n`
    );
  }

  if (
    jsonParams.main_holder_size?.lower ||
    jsonParams.main_holder_size?.upper
  ) {
    filterClauses.push(Prisma.sql`AND p.diamond_holder = 'Có ổ chủ'\n`);
    filterClauses.push(
      Prisma.sql`AND p.main_stone ~ '^[a-zA-Z]+ [0-9]+l[0-9]+$'\n`
    );

    if (jsonParams.main_holder_size?.lower) {
      filterClauses.push(
        Prisma.sql`AND CAST(REPLACE(SPLIT_PART(p.main_stone, ' ', 2), 'l', '.') AS DECIMAL) >= ${jsonParams.main_holder_size.lower}\n`
      );
    }

    if (jsonParams.main_holder_size?.upper) {
      filterClauses.push(
        Prisma.sql`AND CAST(REPLACE(SPLIT_PART(p.main_stone, ' ', 2), 'l', '.') AS DECIMAL) < ${jsonParams.main_holder_size.upper}\n`
      );
    }
  }

  if (jsonParams.pagination) {
    paginationSql = Prisma.sql`LIMIT ${jsonParams.pagination.limit} `;
    if (jsonParams.pagination.from !== 1) {
      paginationSql = Prisma.sql`${paginationSql} OFFSET ${jsonParams.pagination.from - 1}\n`;
    }
  }

  if (needsP2Join) {
    collectionJoinEcomProductsClause =
      "LEFT JOIN ecom.products p2 ON p.haravan_product_id = p2.haravan_product_id";
  }

  if (jsonParams.warehouse_ids && jsonParams.warehouse_ids.length > 0) {
    warehouseJoinClause = `
      INNER JOIN haravan.warehouse_inventories wi
        ON wi.variant_id = v.haravan_variant_id
      INNER JOIN haravan.warehouses w
        ON w.id = wi.loc_id
    `;
    filterClauses.push(
      Prisma.sql`AND w.id = ANY(${jsonParams.warehouse_ids})\n`
    );
  }

  const filterSql =
    filterClauses.length > 0 ? Prisma.join(filterClauses, " ") : Prisma.empty;

  return {
    filterSql,
    sortSql,
    paginationSql,
    handleFinenessPriority,
    collectionJoinEcomProductsClause,
    linkedCollectionJoinEcomProductsClause,
    havingSql,
    warehouseJoinClause
  };
}
