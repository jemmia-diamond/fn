import { Prisma } from "@prisma-cli";

export function aggregateQuery(jsonParams) {
  const filterClauses = [];
  let sortSql = Prisma.empty;
  let paginationSql = Prisma.empty;
  let handleFinenessPriority = "18K";
  let sortedColumn = "p.max_price_18";
  let collectionJoinEcomProductsClause = "";
  let havingSql = Prisma.empty;
  let linkedCollectionJoinEcomProductsClause = "";
  let needsP2Join = false;
  let warehouseJoinClause = "";
  if (jsonParams.is_in_stock) {
    havingSql = Prisma.sql`HAVING SUM(v.qty_available) > 0\n`;
  }

  if (jsonParams.categories && jsonParams.categories.length > 0) {
    filterClauses.push(Prisma.sql`AND p.category = ANY(${jsonParams.categories})\n`);
  }

  if (jsonParams.pages && jsonParams.pages.length > 0) {
    filterClauses.push(Prisma.sql`AND p2.pages = ANY(${jsonParams.pages})\n`);
    needsP2Join = true;
  }

  if (jsonParams.product_types && jsonParams.product_types.length > 0) {
    filterClauses.push(Prisma.sql`AND p.haravan_product_type = ANY(${jsonParams.product_types})\n`);
  }

  if (jsonParams.material_colors && jsonParams.material_colors.length > 0) {
    filterClauses.push(Prisma.sql`AND v.material_color = ANY(${jsonParams.material_colors})\n`);
  }

  if (jsonParams.ring_sizes && jsonParams.ring_sizes.length > 0) {
    filterClauses.push(Prisma.sql`AND v.ring_size = ANY(${jsonParams.ring_sizes})\n`);
  }

  if (jsonParams.fineness && jsonParams.fineness.length > 0) {
    filterClauses.push(Prisma.sql`AND v.fineness = ANY(${jsonParams.fineness})\n`);
    if (jsonParams.fineness.includes("Vàng 14K")) {
      sortedColumn = "p.max_price_14";
      handleFinenessPriority = "14K";
    }
  }

  if (jsonParams.price?.min) {
    filterClauses.push(Prisma.sql`AND p.min_price >= ${jsonParams.price.min}\n`);
  }

  if (jsonParams.price?.max) {
    filterClauses.push(Prisma.sql`AND p.max_price <= ${jsonParams.price.max}\n`);
  }

  if (jsonParams.genders && jsonParams.genders.length > 0) {
    filterClauses.push(Prisma.sql`AND d.gender = ANY(${jsonParams.genders})\n`);
  }

  if (jsonParams.design_tags && jsonParams.design_tags.length > 0) {
    filterClauses.push(Prisma.sql`AND d.tag = ANY(${jsonParams.design_tags})\n`);
  }

  if (jsonParams.linked_collections && jsonParams.linked_collections.length > 0) {
    linkedCollectionJoinEcomProductsClause +=
      "INNER JOIN workplace.products_haravan_collection linked_cp ON linked_cp.products_id = p.workplace_id \n";
    linkedCollectionJoinEcomProductsClause +=
      "INNER JOIN workplace.haravan_collections hc ON hc.id = linked_cp.haravan_collections_id \n";
    filterClauses.push(Prisma.sql`AND hc.title = ANY(${jsonParams.linked_collections})\n`);
  }

  if (jsonParams.ring_head_styles && jsonParams.ring_head_styles.length > 0) {
    const normalizedHeadStyles = jsonParams.ring_head_styles.map((style) =>
      style.trim().toLowerCase()
    );
    filterClauses.push(Prisma.sql`
      AND (
                  (d.ring_head_style IS NOT NULL AND d.ring_head_style != '' AND POSITION(' - ' IN d.ring_head_style) > 0 AND LOWER(SPLIT_PART(d.ring_head_style, ' - ', 2)) = ANY(${normalizedHeadStyles}))
                  OR (d.ring_head_style IS NOT NULL AND d.ring_head_style != '' AND POSITION(' - ' IN d.ring_head_style) = 0 AND LOWER(d.ring_head_style) = ANY(${normalizedHeadStyles}))
                )\n
    `);
  }

  if (jsonParams.ring_band_styles && jsonParams.ring_band_styles.length > 0) {
    const normalizedBandStyles = jsonParams.ring_band_styles.map((style) =>
      style.trim().toLowerCase()
    );
    filterClauses.push(Prisma.sql`
      AND (
                  (d.ring_band_style IS NOT NULL AND d.ring_band_style != '' AND POSITION(' - ' IN d.ring_band_style) > 0 AND LOWER(SPLIT_PART(d.ring_band_style, ' - ', 2)) = ANY(${normalizedBandStyles}))
                  OR (d.ring_band_style IS NOT NULL AND d.ring_band_style != '' AND POSITION(' - ' IN d.ring_band_style) = 0 AND LOWER(d.ring_band_style) = ANY(${normalizedBandStyles}))
                )\n
    `);
  }

  if (jsonParams.excluded_ring_head_styles && jsonParams.excluded_ring_head_styles.length > 0) {
    const normalizedExcludedHeadStyles = jsonParams.excluded_ring_head_styles.map((style) =>
      style.trim().toLowerCase()
    );
    filterClauses.push(Prisma.sql`
      AND (
                    d.ring_head_style IS NULL OR
                    d.ring_head_style = '' OR
                    LOWER(
                      CASE
                        WHEN POSITION(' - ' IN d.ring_head_style) > 0
                        THEN SPLIT_PART(d.ring_head_style, ' - ', 2)
                        ELSE d.ring_head_style
                      END
                    ) != ALL(${normalizedExcludedHeadStyles}::text[])
                  )\n
    `);
  }

  if (jsonParams.excluded_ring_band_styles && jsonParams.excluded_ring_band_styles.length > 0) {
    const normalizedExcludedBandStyles = jsonParams.excluded_ring_band_styles.map((style) =>
      style.trim().toLowerCase()
    );
    filterClauses.push(Prisma.sql`
      AND (
                    d.ring_band_style IS NULL OR
                    d.ring_band_style = '' OR
                    LOWER(
                      CASE
                        WHEN POSITION(' - ' IN d.ring_band_style) > 0
                        THEN SPLIT_PART(d.ring_band_style, ' - ', 2)
                        ELSE d.ring_band_style
                      END
                    ) != ALL(${normalizedExcludedBandStyles}::text[])
                  )\n
    `);
  }

  if (jsonParams.sort?.by === "price") {
    sortSql = Prisma.sql`ORDER BY ${Prisma.raw(sortedColumn)} ${jsonParams.sort.order === "asc" ? Prisma.raw("ASC") : Prisma.raw("DESC")}\n`;
  } else {
    sortSql = Prisma.sql`ORDER BY p2.image_updated_at DESC\n`;
    needsP2Join = true;
  }

  if (jsonParams.product_ids && jsonParams.product_ids.length > 0) {
    const productIds = jsonParams.product_ids.map(id => typeof id === "string" ? BigInt(id) : id);
    filterClauses.push(Prisma.sql`AND p.haravan_product_id = ANY(${productIds})\n`);
  }

  if (jsonParams.main_holder_size?.lower || jsonParams.main_holder_size?.upper) {
    filterClauses.push(Prisma.sql`AND d.diamond_holder = 'Có ổ chủ'\n`);
    filterClauses.push(Prisma.sql`AND d.main_stone ~ '^[a-zA-Z]+ [0-9]+l[0-9]+$'\n`);

    if (jsonParams.main_holder_size?.lower) {
      filterClauses.push(Prisma.sql`AND CAST(REPLACE(SPLIT_PART(d.main_stone, ' ', 2), 'l', '.') AS DECIMAL) >= ${jsonParams.main_holder_size.lower}\n`);
    }

    if (jsonParams.main_holder_size?.upper) {
      filterClauses.push(Prisma.sql`AND CAST(REPLACE(SPLIT_PART(d.main_stone, ' ', 2), 'l', '.') AS DECIMAL) < ${jsonParams.main_holder_size.upper}\n`);
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
    filterClauses.push(Prisma.sql`AND w.id = ANY(${jsonParams.warehouse_ids})\n`);
  }

  const filterSql = filterClauses.length > 0
    ? Prisma.join(filterClauses, " ")
    : Prisma.empty;

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
