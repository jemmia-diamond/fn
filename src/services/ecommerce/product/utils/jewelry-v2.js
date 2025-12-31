// Import aggregateQuery from jewelry.js to reuse filter logic
import { aggregateQuery } from "services/ecommerce/product/utils/jewelry";
import { JEWELRY_IMAGE } from "src/controllers/ecommerce/constant";

export function buildQueryV2(jsonParams) {
  const {
    filterString,
    sortString,
    paginationString,
    handleFinenessPriority,
    collectionJoinEcomProductsClause,
    linkedCollectionJoinEcomProductsClause,
    havingString,
    warehouseJoinClause
  } = aggregateQuery(jsonParams);

  const finenessOrder = handleFinenessPriority === "14K" ? "ASC" : "DESC";

  const priceField = `
    CASE
      WHEN EXISTS (
        SELECT 1 
        FROM workplace.products wp
        INNER JOIN workplace.products_haravan_collection phc ON phc.products_id = wp.id
        INNER JOIN workplace.haravan_collections hc ON hc.id = phc.haravan_collections_id
        WHERE wp.haravan_product_id = v.haravan_product_id
          AND hc.start_date <= NOW() 
          AND hc.end_date >= NOW()
      ) AND v.final_discount_price IS NOT NULL AND v.final_discount_price != 0
      THEN CAST(v.final_discount_price AS DECIMAL)
      ELSE CAST(v.price AS DECIMAL)
    END
  `;

  let lateralJoinClause = "";
  let variantJsonBuildObject = "";
  let diamondJoinsForCount = "";
  let designImagesJoin = "";

  // Pre-aggregate design images by material_color (performance optimization)
  designImagesJoin = `
    LEFT JOIN LATERAL (
      SELECT 
        di.material_color,
        COALESCE(
          array_agg(
            CASE 
              WHEN item.value->>'url' LIKE '${JEWELRY_IMAGE.WORKPLACE_URL_PREFIX}%' THEN
                REPLACE(item.value->>'url', '${JEWELRY_IMAGE.WORKPLACE_FULL_URL}', '${JEWELRY_IMAGE.CDN_URL}')
              ELSE item.value->>'url'
            END
          ) FILTER (WHERE jsonb_typeof(item.value) = 'object' AND item.value->>'url' IS NOT NULL),
          ARRAY[]::text[]
        ) as images
      FROM workplace.design_images di
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE 
          WHEN di.retouch IS NOT NULL AND di.retouch != '' AND jsonb_typeof(di.retouch::jsonb) = 'array'
          THEN di.retouch::jsonb
          ELSE '[]'::jsonb
        END
      ) AS item
      WHERE di.design_id = d.id
      GROUP BY di.material_color
    ) design_imgs ON design_imgs.material_color = v.material_color
  `;

  if (jsonParams.matched_diamonds) {
    // V2 with matched diamonds support
    variantJsonBuildObject = `
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', ${priceField},
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'diamonds', COALESCE(v.diamonds, '[]'::json),
        'images', design_imgs.images
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
          ) FILTER (WHERE dia.product_id IS NOT NULL) AS diamonds
        FROM ecom.materialized_variants v
        LEFT JOIN ecom.jewelry_diamond_pairs jdp
          ON CAST(jdp.haravan_product_id AS BIGINT) = v.haravan_product_id
         AND CAST(jdp.haravan_variant_id AS BIGINT) = v.haravan_variant_id
         AND jdp.is_active = TRUE
        LEFT JOIN workplace.diamonds dia
          ON dia.product_id = CAST(jdp.haravan_diamond_product_id AS BIGINT)
         AND dia.variant_id = CAST(jdp.haravan_diamond_variant_id AS BIGINT)
        WHERE v.haravan_product_id = p.haravan_product_id
        GROUP BY v.haravan_product_id, v.haravan_variant_id, v.sku, v.price,
                 v.price_compare_at, v.material_color, v.fineness, v.ring_size,
                 v.qty_available, v.qty_onhand, v.applique_material,
                 v.estimated_gold_weight, v.ring_band_style, v.ring_head_style,
                 v.final_discount_price
        ORDER BY v.fineness ${finenessOrder}, v.price DESC
      ) v ON TRUE
    `;
  } else {
    // V2 without matched diamonds
    variantJsonBuildObject = `
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', ${priceField},
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'images', design_imgs.images
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
      d.main_stone,
      d.ring_band_type,
      p.haravan_product_type AS product_type,
      p.has_360,
      JSON_AGG(
        ${variantJsonBuildObject}
      ) AS variants
    FROM ecom.materialized_products p 
      INNER JOIN workplace.designs d ON p.design_id = d.id 
      ${collectionJoinEcomProductsClause}
      ${linkedCollectionJoinEcomProductsClause}

      ${lateralJoinClause}
      ${designImagesJoin}
      ${warehouseJoinClause}
    WHERE 1 = 1
      AND p.haravan_product_type != 'Nhẫn Cưới' 
      ${filterString}
    GROUP BY 
      p.haravan_product_id, p.title, d.design_code, p.handle,
      d.diamond_holder, d.main_stone, d.ring_band_type, p.haravan_product_type,
      p.max_price, p.min_price, p.max_price_18, p.max_price_14, 
      p.has_360 ${collectionJoinEcomProductsClause ? ", p2.image_updated_at" : ""}
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
            ${diamondJoinsForCount}
            ${warehouseJoinClause}
        WHERE 1 = 1 
          AND p.haravan_product_type != 'Nhẫn Cưới'
          ${filterString}
        GROUP BY p.haravan_product_id
        ${havingString}
    ) AS subquery
  `;

  return { dataSql, countSql };
}

export function buildQuerySingleV2(params = {}) {
  const priceField = `
    CASE
      WHEN EXISTS (
        SELECT 1 
        FROM workplace.products wp
        INNER JOIN workplace.products_haravan_collection phc ON phc.products_id = wp.id
        INNER JOIN workplace.haravan_collections hc ON hc.id = phc.haravan_collections_id
        WHERE wp.haravan_product_id = v.haravan_product_id
          AND hc.start_date <= NOW() 
          AND hc.end_date >= NOW()
      ) AND v.final_discount_price IS NOT NULL AND v.final_discount_price != 0
      THEN CAST(v.final_discount_price AS DECIMAL)
      ELSE CAST(v.price AS DECIMAL)
    END
  `;

  let lateralJoinClause = "";
  let variantJsonBuildObject = "";

  if (params.matched_diamonds) {
    // With matched diamonds
    variantJsonBuildObject = `
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', ${priceField},
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'applique_material', v.applique_material,
        'estimated_gold_weight', v.estimated_gold_weight,
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'diamonds', COALESCE(v.diamonds, '[]'::json),
        'images', design_imgs.images
      )
    `;

    lateralJoinClause = `
      LEFT JOIN LATERAL (
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
          ) FILTER (WHERE dia.product_id IS NOT NULL) AS diamonds
        FROM ecom.materialized_variants v
        LEFT JOIN ecom.jewelry_diamond_pairs jdp
          ON CAST(jdp.haravan_product_id AS BIGINT) = v.haravan_product_id
         AND CAST(jdp.haravan_variant_id AS BIGINT) = v.haravan_variant_id
         AND jdp.is_active = TRUE
        LEFT JOIN workplace.diamonds dia
          ON dia.product_id = CAST(jdp.haravan_diamond_product_id AS BIGINT)
         AND dia.variant_id = CAST(jdp.haravan_diamond_variant_id AS BIGINT)
        WHERE v.haravan_product_id = p.haravan_product_id
        GROUP BY
          v.haravan_product_id, v.haravan_variant_id, v.sku,
          v.price, v.price_compare_at, v.material_color, v.fineness,
          v.ring_size, v.qty_available, v.qty_onhand,
          v.applique_material, v.estimated_gold_weight,
          v.ring_band_style, v.ring_head_style, v.final_discount_price
        ORDER BY v.fineness, v.price DESC
      ) v ON TRUE
    `;
  } else {
    // Without matched diamonds
    variantJsonBuildObject = `
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', ${priceField},
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'applique_material', v.applique_material,
        'estimated_gold_weight', v.estimated_gold_weight,
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'images', design_imgs.images
      )
    `;

    lateralJoinClause = `
      INNER JOIN LATERAL (
        SELECT *
        FROM ecom.materialized_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
        ORDER BY v.fineness, v.price DESC
      ) v ON TRUE
    `;
  }

  return { variantJsonBuildObject, lateralJoinClause };
}
