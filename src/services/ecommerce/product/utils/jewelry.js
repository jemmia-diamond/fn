export function buildQuery(jsonParams) {
  const { filterString, sortString, paginationString, handleFinenessPriority } = aggregateQuery(jsonParams);

  const finenessOrder = handleFinenessPriority === "14K" ? "ASC" : "DESC";

  const dataSql = `
    SELECT  
      CAST(p.haravan_product_id AS INT) AS id,
      p.title,
      d.design_code,
      p.handle,
      d.diamond_holder,
      d.ring_band_type,
      p.haravan_product_type AS product_type,
      CASE 
        WHEN e.product_id IS NULL THEN FALSE 
        ELSE TRUE 
      END AS has_360,
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
    FROM ecom.products p
      INNER JOIN workplace.designs d ON d.id = p.design_id
      LEFT JOIN workplace.ecom_360 e ON p.workplace_id = e.product_id

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
        FROM ecom.variants v
        WHERE v.hararvan_product_id = p.haravan_product_id
        ORDER BY v.fineness ${finenessOrder}, v.price DESC
      ) v ON TRUE
    WHERE 1 = 1
      AND (p.haravan_product_type != 'Nhẫn Cưới' OR (p.haravan_product_type = 'Nhẫn Cưới' AND d.gender = 'Nam'))
      ${filterString}
    GROUP BY 
      p.haravan_product_id, p.title, d.design_code, p.handle, 
      d.diamond_holder, d.ring_band_type, p.haravan_product_type,
      CASE WHEN e.product_id IS NULL THEN FALSE ELSE TRUE END,
      p.max_price, p.min_price, p.max_price_18, p.max_price_14, 
      p.qty_onhand, p.image_updated_at, img.images
    ${sortString}
    ${paginationString}
  `;

  const countSql = `
      SELECT CAST(COUNT(*) OVER() AS INT) AS total
      FROM ecom.products p 
        INNER JOIN workplace.designs d ON d.id = p.design_id
        LEFT JOIN workplace.ecom_360 e ON p.workplace_id = e.product_id
        INNER JOIN haravan.images i ON i.product_id = p.haravan_product_id
        INNER JOIN ecom.variants v ON v.hararvan_product_id = p.haravan_product_id
      WHERE 1 = 1 ${filterString}
      GROUP BY p.haravan_product_id
      LIMIT 1
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

  if (jsonParams.categories && jsonParams.categories.length > 0) {
    filterString += `AND p.category IN ('${jsonParams.categories.join("','")}')\n`;
  }

  if (jsonParams.pages && jsonParams.pages.length > 0) {
    filterString += `AND p.pages IN ('${jsonParams.pages.join("','")}')\n`;
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

  if (jsonParams.price) {
    filterString += `AND p.min_price >= ${jsonParams.price.min} AND p.max_price <= ${jsonParams.price.max}\n`;
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
    handleFinenessPriority
  };
}
