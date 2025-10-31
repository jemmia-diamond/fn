export function buildQuery(jsonParams) {
  const {
    filterString,
    sortString,
    paginationString,
    handleFinenessPriority,
    collectionJoinEcomProductsClause,
    linkedCollectionJoinEcomProductsClause,
    havingString
  } = aggregateQuery(jsonParams);

  const finenessOrder = handleFinenessPriority === "14K" ? "ASC" : "DESC";

  let diamondJoinsForCount = "";
  let diamondFiltersForCount = "";
  let lateralJoinClause = "";
  let variantJsonBuildObject = "";

  if (jsonParams.matched_diamonds) {

    diamondJoinsForCount = `
      INNER JOIN ecom.jewelry_diamond_pairs jdp 
        ON CAST(jdp.haravan_product_id AS BIGINT) = v.haravan_product_id 
       AND CAST(jdp.haravan_variant_id AS BIGINT) = v.haravan_variant_id
      INNER JOIN workplace.diamonds dia 
        ON dia.product_id = CAST(jdp.haravan_diamond_product_id AS BIGINT) 
       AND dia.variant_id = CAST(jdp.haravan_diamond_variant_id AS BIGINT)
    `;

    diamondFiltersForCount = `
      AND jdp.is_active = TRUE
    `;

    variantJsonBuildObject = `
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', CAST(v.price AS DECIMAL),
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'diamonds', v.diamonds
      )
    `;

    lateralJoinClause = `
      INNER JOIN LATERAL (
        SELECT 
          v.*,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'product_id', dia.product_id,
              'variant_id', dia.variant_id,
              'report_no', dia.report_no,
              'shape', dia.shape,
              'carat', dia.carat,
              'color', dia.color,
              'clarity', dia.clarity,
              'cut', dia.cut,
              'edge_size_1', dia.edge_size_1,
              'edge_size_2', dia.edge_size_2,
              'compare_at_price', CAST(dia.price AS DECIMAL),
              'price', CASE
                WHEN dia.promotions ILIKE '%8%%' THEN ROUND(dia.price * 0.92, 2)
                ELSE dia.price
              END
            )
          ) AS diamonds
        FROM ecom.materialized_variants v
        INNER JOIN ecom.jewelry_diamond_pairs jdp 
          ON CAST(jdp.haravan_product_id AS BIGINT) = v.haravan_product_id 
         AND CAST(jdp.haravan_variant_id AS BIGINT) = v.haravan_variant_id
        INNER JOIN workplace.diamonds dia 
          ON dia.product_id = CAST(jdp.haravan_diamond_product_id AS BIGINT) 
         AND dia.variant_id = CAST(jdp.haravan_diamond_variant_id AS BIGINT)
        WHERE v.haravan_product_id = p.haravan_product_id
          AND jdp.is_active = TRUE
        GROUP BY v.haravan_product_id, v.haravan_variant_id, v.sku, v.price, 
                 v.price_compare_at, v.material_color, v.fineness, v.ring_size, 
                 v.qty_available, v.qty_onhand, v.applique_material, 
                 v.estimated_gold_weight, v.ring_band_style, v.ring_head_style
        ORDER BY v.fineness ${finenessOrder}, v.price DESC
      ) v ON TRUE
    `;
  } else {
    variantJsonBuildObject = `
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', CAST(v.price AS DECIMAL),
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand
      )
    `;

    lateralJoinClause = `
      INNER JOIN LATERAL (
        SELECT *
        FROM ecom.materialized_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
        ORDER BY v.fineness ${finenessOrder}, v.price DESC
      ) v ON TRUE
    `;
  }

  const dataSql = `
    SELECT  
      CAST(p.haravan_product_id AS INT) AS id,
      p.title,
      d.design_code,
      p.handle,
      d.diamond_holder,
      d.ring_band_type,
      p.haravan_product_type AS product_type,
      p.has_360,
      img.images,
      JSON_AGG(
        ${variantJsonBuildObject}
      ) AS variants
    FROM ecom.materialized_products p 
      INNER JOIN workplace.designs d ON p.design_id = d.id 
      ${collectionJoinEcomProductsClause}
      ${linkedCollectionJoinEcomProductsClause}

      -- Subquery for pre-aggregated images
      INNER JOIN (
        SELECT 
          i.product_id,
          array_agg(i.src ORDER BY i.src) AS images
        FROM haravan.images i
        GROUP BY i.product_id
      ) img ON img.product_id = p.haravan_product_id

      ${lateralJoinClause}
    WHERE 1 = 1
      AND (p.haravan_product_type != 'Nhẫn Cưới')
      ${filterString}
    GROUP BY 
      p.haravan_product_id, p.title, d.design_code, p.handle, 
      d.diamond_holder, d.ring_band_type, p.haravan_product_type,
      p.max_price, p.min_price, p.max_price_18, p.max_price_14, 
      img.images, p.has_360 ${collectionJoinEcomProductsClause ? ", p2.image_updated_at" : ""}
    ${havingString}
    ${sortString}
    ${paginationString}
  `;

  const countSql = `
    SELECT
      COUNT(*) AS total,
      (SELECT ARRAY_AGG(DISTINCT mv.material_color)
       FROM ecom.materialized_variants mv) AS material_colors,
      (SELECT ARRAY_AGG(DISTINCT mv.fineness)
       FROM ecom.materialized_variants mv) AS fineness
    FROM (
      SELECT p.haravan_product_id
      FROM ecom.materialized_products p
        INNER JOIN workplace.designs d ON d.id = p.design_id
        ${collectionJoinEcomProductsClause}
        ${linkedCollectionJoinEcomProductsClause}
        INNER JOIN ecom.materialized_variants v
          ON v.haravan_product_id = p.haravan_product_id
        ${diamondJoinsForCount}
      WHERE 1 = 1
        AND p.haravan_product_type != 'Nhẫn Cưới'
        ${filterString}
        ${diamondFiltersForCount}
      GROUP BY p.haravan_product_id
      ${havingString}
    ) AS sub;
  `;

  return {
    dataSql,
    countSql
  };
}

export function buildQuerySingle({ matchedDiamonds }) {
  let variantJsonBuildObject = `
     \n
    JSON_BUILD_OBJECT(
      'id', CAST(v.haravan_variant_id AS INT),
      'fineness', v.fineness,
      'material_color', v.material_color,
      'ring_size', v.ring_size,
      'price', CAST(v.price AS DECIMAL),
      'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
      'applique_material', v.applique_material,
      'estimated_gold_weight', v.estimated_gold_weight,
      'qty_available', v.qty_available,
      'qty_onhand', v.qty_onhand 
    ) \n
  `;

  let lateralJoinClause = `
    \n 
    INNER JOIN LATERAL (
      SELECT *
      FROM ecom.materialized_variants v
      WHERE v.haravan_product_id = p.haravan_product_id
      ORDER BY v.fineness, v.price DESC
    ) v ON TRUE 
    \n
  `;

  if (matchedDiamonds) {
    variantJsonBuildObject = `
      \n
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', CAST(v.price AS DECIMAL),
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'applique_material', v.applique_material,
        'estimated_gold_weight', v.estimated_gold_weight,
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'diamonds', v.diamonds
      ) 
      \n
    `;

    lateralJoinClause = `
      \n 
      INNER JOIN LATERAL (
        SELECT 
          v.*,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'product_id', dia.product_id,
              'variant_id', dia.variant_id,
              'report_no', dia.report_no,
              'shape', dia.shape,
              'carat', dia.carat,
              'color', dia.color,
              'clarity', dia.clarity,
              'cut', dia.cut,
              'edge_size_1', dia.edge_size_1,
              'edge_size_2', dia.edge_size_2,
              'compare_at_price', CAST(dia.price AS DECIMAL),
              'price', CASE
                WHEN dia.promotions ILIKE '%8%%' THEN ROUND(dia.price * 0.92, 2)
                ELSE dia.price
              END
            )
          ) AS diamonds
        FROM ecom.materialized_variants v
        INNER JOIN ecom.jewelry_diamond_pairs jdp 
          ON CAST(jdp.haravan_product_id AS BIGINT) = v.haravan_product_id 
         AND CAST(jdp.haravan_variant_id AS BIGINT) = v.haravan_variant_id
        INNER JOIN workplace.diamonds dia 
          ON dia.product_id = CAST(jdp.haravan_diamond_product_id AS BIGINT) 
         AND dia.variant_id = CAST(jdp.haravan_diamond_variant_id AS BIGINT)
        WHERE v.haravan_product_id = p.haravan_product_id
          AND jdp.is_active = TRUE
        GROUP BY v.haravan_product_id, v.haravan_variant_id, v.sku, v.price, v.price_compare_at, 
                 v.material_color, v.fineness, v.ring_size, v.qty_available, v.qty_onhand, 
                 v.applique_material, v.estimated_gold_weight, v.ring_band_style, v.ring_head_style
        ORDER BY v.fineness, v.price DESC
      ) v ON TRUE 
      \n
    `;
  }

  return { variantJsonBuildObject, lateralJoinClause };
}

export function aggregateQuery(jsonParams) {
  let filterString = "";
  let sortString = "";
  let paginationString = "";
  let handleFinenessPriority = "18K";
  let sortedColumn = "p.max_price_18";
  let collectionJoinEcomProductsClause = "";
  let havingString = "";
  let linkedCollectionJoinEcomProductsClause = "";
  let needsP2Join = false;

  if (jsonParams.is_in_stock) {
    havingString += "HAVING SUM(v.qty_available) > 0\n";
  }

  if (jsonParams.categories && jsonParams.categories.length > 0) {
    filterString += `AND p.category IN ('${jsonParams.categories.join("','")}')\n`;
  }

  if (jsonParams.pages && jsonParams.pages.length > 0) {
    filterString += `AND p2.pages IN ('${jsonParams.pages.join("','")}')\n`;
    needsP2Join = true;
  }

  if (jsonParams.product_types && jsonParams.product_types.length > 0) {
    filterString += `AND p.haravan_product_type IN ('${jsonParams.product_types.join("','")}')\n`;
  }

  if (jsonParams.material_colors && jsonParams.material_colors.length > 0) {
    filterString += `AND v.material_color IN ('${jsonParams.material_colors.join("','")}')\n`;
  }

  if (jsonParams.fineness && jsonParams.fineness.length > 0) {
    filterString += `AND v.fineness IN ('${jsonParams.fineness.join("','")}')\n`;
    if (jsonParams.fineness.includes("Vàng 14K")) {
      sortedColumn = "p.max_price_14";
      handleFinenessPriority = "14K";
    }
  }

  if (jsonParams.price?.min) {
    filterString += `AND p.min_price >= ${jsonParams.price.min}\n`;
  }

  if (jsonParams.price?.max) {
    filterString += `AND p.max_price <= ${jsonParams.price.max}\n`;
  }

  if (jsonParams.genders && jsonParams.genders.length > 0) {
    filterString += `AND d.gender IN ('${jsonParams.genders.join("','")}')\n`;
  }

  if (jsonParams.design_tags && jsonParams.design_tags.length > 0) {
    filterString += `AND d.tag IN ('${jsonParams.design_tags.join("','")}')\n`;
  }

  if (jsonParams.linked_collections && jsonParams.linked_collections.length > 0) {
    linkedCollectionJoinEcomProductsClause += "INNER JOIN workplace._nc_m2m_haravan_collect_products linked_cp ON linked_cp.products_id = p.workplace_id \n";
    linkedCollectionJoinEcomProductsClause += "INNER JOIN workplace.haravan_collections hc ON hc.id = linked_cp.haravan_collections_id \n";
    filterString += `AND hc.title IN ('${jsonParams.linked_collections.join("','")}')\n`;
  }

  if (jsonParams.ring_head_styles && jsonParams.ring_head_styles.length > 0) {
    const normalizedHeadStyles = jsonParams.ring_head_styles.map(style => style.trim().toLowerCase());
    filterString += "AND (\n";
    filterString += `  (d.ring_head_style IS NOT NULL AND d.ring_head_style != '' AND POSITION(' - ' IN d.ring_head_style) > 0 AND LOWER(SPLIT_PART(d.ring_head_style, ' - ', 2)) IN ('${normalizedHeadStyles.join("','")}'))\n`;
    filterString += `  OR (d.ring_head_style IS NOT NULL AND d.ring_head_style != '' AND POSITION(' - ' IN d.ring_head_style) = 0 AND LOWER(d.ring_head_style) IN ('${normalizedHeadStyles.join("','")}'))\n`;
    filterString += ")\n";
  }

  if (jsonParams.ring_band_styles && jsonParams.ring_band_styles.length > 0) {
    const normalizedBandStyles = jsonParams.ring_band_styles.map(style => style.trim().toLowerCase());
    filterString += "AND (\n";
    filterString += `  (d.ring_band_style IS NOT NULL AND d.ring_band_style != '' AND POSITION(' - ' IN d.ring_band_style) > 0 AND LOWER(SPLIT_PART(d.ring_band_style, ' - ', 2)) IN ('${normalizedBandStyles.join("','")}'))\n`;
    filterString += `  OR (d.ring_band_style IS NOT NULL AND d.ring_band_style != '' AND POSITION(' - ' IN d.ring_band_style) = 0 AND LOWER(d.ring_band_style) IN ('${normalizedBandStyles.join("','")}'))\n`;
    filterString += ")\n";
  }

  if (jsonParams.excluded_ring_head_styles && jsonParams.excluded_ring_head_styles.length > 0) {
    const normalizedExcludedHeadStyles = jsonParams.excluded_ring_head_styles.map(style => style.trim().toLowerCase());
    filterString += `
      AND (
        d.ring_head_style IS NULL OR
        d.ring_head_style = '' OR
        LOWER(
          CASE
            WHEN POSITION(' - ' IN d.ring_head_style) > 0
            THEN SPLIT_PART(d.ring_head_style, ' - ', 2)
            ELSE d.ring_head_style
          END
        ) NOT IN ('${normalizedExcludedHeadStyles.join("','")}')
      )
    `;
  }

  if (jsonParams.excluded_ring_band_styles && jsonParams.excluded_ring_band_styles.length > 0) {
    const normalizedExcludedBandStyles = jsonParams.excluded_ring_band_styles.map(style => style.trim().toLowerCase());
    filterString += `
      AND (
        d.ring_band_style IS NULL OR
        d.ring_band_style = '' OR
        LOWER(
          CASE
            WHEN POSITION(' - ' IN d.ring_band_style) > 0
            THEN SPLIT_PART(d.ring_band_style, ' - ', 2)
            ELSE d.ring_band_style
          END
        ) NOT IN ('${normalizedExcludedBandStyles.join("','")}')
      )
    `;
  }

  if (jsonParams.sort?.by === "price") {
    sortString += `ORDER BY ${sortedColumn} ${jsonParams.sort.order === "asc" ? "ASC" : "DESC"}\n`;
  } else {
    sortString += "ORDER BY p2.image_updated_at DESC\n";
    needsP2Join = true;
  }

  if (jsonParams.product_ids && jsonParams.product_ids.length) {
    filterString += `
      AND p.haravan_product_id IN (${jsonParams.product_ids.join(",")})
    `;
  }

  if (jsonParams.pagination) {
    paginationString += `LIMIT ${jsonParams.pagination.limit} `;
    if (jsonParams.pagination.from !== 1) {
      paginationString += `OFFSET ${jsonParams.pagination.from - 1}\n`;
    }
  }

  if (needsP2Join) {
    collectionJoinEcomProductsClause = "LEFT JOIN ecom.products p2 ON p.haravan_product_id = p2.haravan_product_id";
  }

  return {
    filterString,
    sortString,
    paginationString,
    handleFinenessPriority,
    collectionJoinEcomProductsClause,
    linkedCollectionJoinEcomProductsClause,
    havingString
  };
}
