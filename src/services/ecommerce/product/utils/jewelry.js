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

  if (jsonParams.matched_diamonds) {
    // Logic for dynamic 1-to-1 or 1-to-2 (for earrings) diamond pairing
    let variantFilterString = "";
    if (jsonParams.material_colors?.length)
      variantFilterString += `AND v.material_color IN ('${jsonParams.material_colors.join("','")}')\n`;
    if (jsonParams.fineness?.length)
      variantFilterString += `AND v.fineness IN ('${jsonParams.fineness.join("','")}')\n`;

    const dataSql = `
      WITH FilteredProducts AS (
        SELECT p.haravan_product_id
        FROM ecom.materialized_products p 
          INNER JOIN workplace.designs d ON d.id = p.design_id
          ${collectionJoinEcomProductsClause}
          ${linkedCollectionJoinEcomProductsClause}
          INNER JOIN ecom.materialized_variants v ON v.haravan_product_id = p.haravan_product_id
        WHERE 1 = 1 
          AND (p.haravan_product_type != 'Nhẫn Cưới')
        ${filterString}
        GROUP BY p.haravan_product_id
        ${havingString}
      ),
      VariantsWithProductType AS (
        SELECT 
          v.*,
          p.haravan_product_type
        FROM ecom.materialized_variants v
        JOIN ecom.materialized_products p ON v.haravan_product_id = p.haravan_product_id
        WHERE v.haravan_product_id IN (SELECT haravan_product_id FROM FilteredProducts)
          ${variantFilterString}
      ),
      NumberedVariantsBase AS (
        SELECT
          v.*,
          CASE WHEN v.haravan_product_type = 'Bông Tai' THEN 2 ELSE 1 END AS diamond_consumption,
          SUM(CASE WHEN v.haravan_product_type = 'Bông Tai' THEN 2 ELSE 1 END)
            OVER (ORDER BY v.haravan_product_id, v.fineness ${finenessOrder}, v.price DESC, v.haravan_variant_id)
            AS cumulative_consumption
        FROM VariantsWithProductType v
      ),
      ExpandedVariants AS (
        SELECT
          v.*,
          generate_series(
            v.cumulative_consumption - v.diamond_consumption + 1,
            v.cumulative_consumption
          ) AS rn
        FROM NumberedVariantsBase v
      ),

      -- Diamond dedup: use ROW_NUMBER() PARTITION BY product_id then pick dedup_rank = 1,
      -- then assign a stable overall rn for pairing.
      DedupedDiamonds AS (
        SELECT d_inner.*
        FROM (
          SELECT
            d.*,
            ROW_NUMBER() OVER (PARTITION BY d.product_id ORDER BY d.id) AS dedup_rank
          FROM workplace.diamonds d
          INNER JOIN haravan.warehouse_inventories i ON i.product_id = d.product_id
          INNER JOIN haravan.warehouses w ON w.id = i.loc_id
          WHERE d.qty_available IS NOT NULL AND d.qty_available > 0
            AND w.name IN ('[HCM] Cửa Hàng HCM', '[HN] Cửa Hàng HN', '[CT] Cửa Hàng Cần Thơ')
            AND d.edge_size_1 BETWEEN 4.4 AND 4.6
            AND d.edge_size_2 BETWEEN 4.4 AND 4.6
        ) d_inner
        WHERE d_inner.dedup_rank = 1
      ),
      NumberedDiamonds AS (
        SELECT
          dd.product_id,
          dd.variant_id,
          dd.report_no,
          dd.shape,
          dd.carat,
          dd.color,
          dd.clarity,
          dd.cut,
          dd.edge_size_1,
          dd.edge_size_2,
          ROW_NUMBER() OVER (ORDER BY dd.edge_size_1, dd.variant_id, dd.product_id) AS rn
        FROM DedupedDiamonds dd
      ),

      PairedVariantsWithDiamondObject AS (
        SELECT
          ev.*,
          JSON_BUILD_OBJECT(
            'product_id', nd.product_id,
            'variant_id', nd.variant_id,
            'report_no', nd.report_no,
            'shape', nd.shape,
            'carat', nd.carat,
            'color', nd.color,
            'clarity', nd.clarity,
            'cut', nd.cut
          ) AS diamond,
          nd.rn AS diamond_rn
        FROM ExpandedVariants ev
        INNER JOIN NumberedDiamonds nd ON ev.rn = nd.rn
      ),
      AggregatedPairedVariants AS (
        SELECT
          pv.haravan_product_id,
          pv.haravan_variant_id,
          pv.fineness,
          pv.material_color,
          pv.ring_size,
          pv.price,
          pv.price_compare_at,
          pv.qty_available,
          pv.qty_onhand,
          JSON_AGG(pv.diamond ORDER BY pv.diamond_rn) AS diamonds
        FROM PairedVariantsWithDiamondObject pv
        GROUP BY
          pv.haravan_product_id, pv.haravan_variant_id, pv.fineness, pv.material_color,
          pv.ring_size, pv.price, pv.price_compare_at, pv.qty_available, pv.qty_onhand
      )
      SELECT
        CAST(p.haravan_product_id AS INT) AS id,
        p.ecom_title AS title,
        d.design_code,
        p.handle,
        d.diamond_holder,
        d.ring_band_type,
        p.haravan_product_type AS product_type,
        p.has_360,
        img.images,
        v_agg.variants
      FROM ecom.materialized_products p
      INNER JOIN workplace.designs d ON p.design_id = d.id
      ${collectionJoinEcomProductsClause}
      ${linkedCollectionJoinEcomProductsClause}
      INNER JOIN (
        SELECT
          i.product_id,
          array_agg(i.src ORDER BY i.src) AS images
        FROM haravan.images i
        GROUP BY i.product_id
      ) img ON img.product_id = p.haravan_product_id
      INNER JOIN (
        SELECT
          apv.haravan_product_id,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', CAST(apv.haravan_variant_id AS INT),
              'fineness', apv.fineness,
              'material_color', apv.material_color,
              'ring_size', apv.ring_size,
              'price', CAST(apv.price AS Decimal),
              'price_compare_at', CAST(apv.price_compare_at AS Decimal),
              'qty_available', apv.qty_available,
              'qty_onhand', apv.qty_onhand,
              'diamonds', apv.diamonds
            ) ORDER BY apv.fineness ${finenessOrder}, apv.price DESC
          ) AS variants
        FROM AggregatedPairedVariants apv
        GROUP BY apv.haravan_product_id
      ) v_agg ON v_agg.haravan_product_id = p.haravan_product_id
      WHERE p.haravan_product_id IN (SELECT haravan_product_id FROM FilteredProducts)
      ${sortString}
      ${paginationString}
    `;

    const countSql = `
      WITH FilteredProducts AS (
        SELECT p.haravan_product_id
        FROM ecom.materialized_products p 
          INNER JOIN workplace.designs d ON d.id = p.design_id
          ${collectionJoinEcomProductsClause}
          ${linkedCollectionJoinEcomProductsClause}
          INNER JOIN ecom.materialized_variants v ON v.haravan_product_id = p.haravan_product_id
        WHERE 1 = 1 AND (p.haravan_product_type != 'Nhẫn Cưới') ${filterString}
        GROUP BY p.haravan_product_id
        ${havingString}
      ),
      VariantsWithProductType AS (
        SELECT v.*, p.haravan_product_type
        FROM ecom.materialized_variants v
        JOIN ecom.materialized_products p ON v.haravan_product_id = p.haravan_product_id
        WHERE v.haravan_product_id IN (SELECT haravan_product_id FROM FilteredProducts)
        ${variantFilterString}
      ),
      NumberedVariantsBase AS (
        SELECT
          v.*,
          SUM(CASE WHEN v.haravan_product_type = 'Bông Tai' THEN 2 ELSE 1 END)
            OVER (ORDER BY v.haravan_product_id, v.fineness ${finenessOrder}, v.price DESC, v.haravan_variant_id)
            AS cumulative_consumption,
          CASE WHEN v.haravan_product_type = 'Bông Tai' THEN 2 ELSE 1 END AS diamond_consumption
        FROM VariantsWithProductType v
      ),
      ExpandedVariants AS (
        SELECT
          v.haravan_product_id,
          generate_series(
            v.cumulative_consumption - v.diamond_consumption + 1,
            v.cumulative_consumption
          ) AS rn
        FROM NumberedVariantsBase v
      ),
      DedupedDiamonds AS (
        SELECT d_inner.*
        FROM (
          SELECT
            d.*,
            ROW_NUMBER() OVER (PARTITION BY d.product_id ORDER BY d.id) AS dedup_rank
          FROM workplace.diamonds d
          INNER JOIN haravan.warehouse_inventories i ON i.product_id = d.product_id
          INNER JOIN haravan.warehouses w ON w.id = i.loc_id
          WHERE d.qty_available > 0
            AND w.name IN ('[HCM] Cửa Hàng HCM', '[HN] Cửa Hàng HN', '[CT] Cửa Hàng Cần Thơ')
            AND d.edge_size_1 BETWEEN 4.4 AND 4.6
            AND d.edge_size_2 BETWEEN 4.4 AND 4.6
        ) d_inner
        WHERE d_inner.dedup_rank = 1
      ),
      NumberedDiamonds AS (
        SELECT ROW_NUMBER() OVER (ORDER BY dd.edge_size_1, dd.variant_id, dd.product_id) AS rn
        FROM DedupedDiamonds dd
      )
      SELECT
        COUNT(DISTINCT ev.haravan_product_id) AS total,
        (SELECT ARRAY_AGG(DISTINCT mv.material_color) FROM ecom.materialized_variants mv) AS material_colors,
        (SELECT ARRAY_AGG(DISTINCT mv.fineness) FROM ecom.materialized_variants mv) AS fineness
      FROM ExpandedVariants ev
      INNER JOIN NumberedDiamonds nd ON ev.rn = nd.rn
    `;

    return { dataSql, countSql };
  }

  // Default logic for when matched_diamonds is false
  const variantJsonBuildObject = `
    JSON_BUILD_OBJECT(
      'id', CAST(v.haravan_variant_id AS INT),
      'fineness', v.fineness,
      'material_color', v.material_color,
      'ring_size', v.ring_size,
      'price', CAST(v.price AS Decimal),
      'price_compare_at', CAST(v.price_compare_at AS Decimal),
      'qty_available', v.qty_available,
      'qty_onhand', v.qty_onhand
    )
  `;

  // Default logic for when matched_diammonds is false
  const lateralJoinClause = `
    INNER JOIN LATERAL (
      SELECT *
      FROM ecom.materialized_variants v
      WHERE v.haravan_product_id = p.haravan_product_id
      ORDER BY v.fineness ${finenessOrder}, v.price DESC
    ) v ON TRUE
  `;

  const dataSql = `
    SELECT  
      CAST(p.haravan_product_id AS INT) AS id,
      p.ecom_title as title,
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
      p.haravan_product_id, p.title, d.design_code, p.handle, p.ecom_title,
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
     (SELECT ARRAY_AGG(DISTINCT mv.material_color ) FROM ecom.materialized_variants mv) AS material_colors,
     (SELECT ARRAY_AGG(DISTINCT mv.fineness ) FROM ecom.materialized_variants mv) AS fineness
    FROM (
        SELECT p.haravan_product_id
        FROM ecom.materialized_products p 
            INNER JOIN workplace.designs d ON d.id = p.design_id
            ${collectionJoinEcomProductsClause}
            ${linkedCollectionJoinEcomProductsClause}
            INNER JOIN ecom.materialized_variants v ON v.haravan_product_id = p.haravan_product_id
        WHERE 1 = 1 
          AND (p.haravan_product_type != 'Nhẫn Cưới')
        ${filterString}
        GROUP BY p.haravan_product_id
        ${havingString}
      ) as sub
  `;

  return {
    dataSql,
    countSql
  };
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
