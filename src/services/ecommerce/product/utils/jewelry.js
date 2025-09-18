export function buildQuery(jsonParams) {
  const { filterString, sortString, paginationString, handleFinenessPriority, collectionJoinEcomProductsClause } = aggregateQuery(jsonParams);

  const finenessOrder = handleFinenessPriority === "14K" ? "ASC" : "DESC";

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
        JSON_BUILD_OBJECT(
          'id', CAST(v.haravan_variant_id AS INT),
          'fineness', v.fineness,
          'material_color', v.material_color,
          'ring_size', v.ring_size,
          'price', CAST(v.price AS INT),
          'price_compare_at', CAST(v.price_compare_at AS INT)
        )
      ) AS variants
    FROM ecom.materialized_products p 
      INNER JOIN workplace.designs d ON p.design_id = d.id 
      ${collectionJoinEcomProductsClause}

      -- Subquery for pre-aggregated images
      INNER JOIN (
        SELECT 
          i.product_id,
          array_agg(i.src ORDER BY i.src) AS images
        FROM haravan.images i
        GROUP BY i.product_id
      ) img ON img.product_id = p.haravan_product_id

      INNER JOIN LATERAL (
        SELECT *
        FROM ecom.materialized_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
        ORDER BY v.fineness ${finenessOrder}, v.price DESC
      ) v ON TRUE
    WHERE 1 = 1
      AND (p.haravan_product_type != 'Nhẫn Cưới' OR (p.haravan_product_type = 'Nhẫn Cưới' AND d.gender = 'Nam'))
      ${filterString}
    GROUP BY 
      p.haravan_product_id, p.title, d.design_code, p.handle, p.ecom_title,
      d.diamond_holder, d.ring_band_type, p.haravan_product_type,
      p.max_price, p.min_price, p.max_price_18, p.max_price_14, 
      p.qty_onhand, img.images, p.has_360
    ${sortString}
    ${paginationString}
  `;

  const countSql = `
    SELECT
     COUNT(DISTINCT p.haravan_product_id) AS total,
     (SELECT ARRAY_AGG(DISTINCT mv.material_color ) FROM ecom.materialized_variants mv) AS material_colors,
     (SELECT ARRAY_AGG(DISTINCT mv.fineness ) FROM ecom.materialized_variants mv) AS fineness
    FROM ecom.materialized_products p 
        INNER JOIN workplace.designs d ON d.id = p.design_id
        ${collectionJoinEcomProductsClause}
        INNER JOIN haravan.images i ON i.product_id = p.haravan_product_id
        INNER JOIN ecom.materialized_variants v ON v.haravan_product_id = p.haravan_product_id
    WHERE 1 = 1 
      AND (p.haravan_product_type != 'Nhẫn Cưới' OR (p.haravan_product_type = 'Nhẫn Cưới' AND d.gender = 'Nam'))
    ${filterString}
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

  if (jsonParams.is_in_stock) {
    filterString += "AND p.qty_onhand > 0\n";
  }

  if (jsonParams.categories && jsonParams.categories.length > 0) {
    filterString += `AND p.category IN ('${jsonParams.categories.join("','")}')\n`;
  }

  if (jsonParams.pages && jsonParams.pages.length > 0) {
    filterString += `AND p2.pages IN ('${jsonParams.pages.join("','")}')\n`;
    collectionJoinEcomProductsClause = "LEFT JOIN ecom.products p2 ON p.haravan_product_id = p2.haravan_product_id";
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

  if (jsonParams.sort) {
    if (jsonParams.sort.by === "price") {
      sortString += `ORDER BY ${sortedColumn} ${jsonParams.sort.order === "asc" ? "ASC" : "DESC"}\n`;
    } else if (jsonParams.sort.by === "stock") {
      sortString += `ORDER BY p.qty_onhand ${jsonParams.sort.order === "asc" ? "ASC" : "DESC"}\n`;
    } else {
      sortString += "ORDER BY p.image_updated_at DESC\n";
    }
  } else {
    sortString += "ORDER BY p.image_updated_at DESC\n";
  }

  if (jsonParams.pagination) {
    paginationString += `LIMIT ${jsonParams.pagination.limit} `;
    if (jsonParams.pagination.from !== 1) {
      paginationString += `OFFSET ${jsonParams.pagination.from - 1}\n`;
    }
  }

  return {
    filterString,
    sortString,
    paginationString,
    handleFinenessPriority,
    collectionJoinEcomProductsClause
  };
}
