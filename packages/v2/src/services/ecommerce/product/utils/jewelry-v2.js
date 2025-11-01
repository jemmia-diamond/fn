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
    havingString
  } = aggregateQuery(jsonParams);

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
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', CAST(v.haravan_variant_id AS INT),
          'fineness', v.fineness,
          'material_color', v.material_color,
          'ring_size', v.ring_size,
          'price', CAST(v.price AS Decimal),
          'price_compare_at', CAST(v.price_compare_at AS Decimal),
          'qty_available', v.qty_available,
          'qty_onhand', v.qty_onhand,
          'images', (
            SELECT 
              COALESCE(
                array_agg(
                  CASE 
                    WHEN item.value->>'url' LIKE '${JEWELRY_IMAGE.WORKPLACE_URL_PREFIX}%' THEN
                      REPLACE(item.value->>'url', '${JEWELRY_IMAGE.WORKPLACE_FULL_URL}', '${JEWELRY_IMAGE.CDN_URL}')
                    ELSE item.value->>'url'
                  END
                ) FILTER (WHERE jsonb_typeof(item.value) = 'object' AND item.value->>'url' IS NOT NULL),
                ARRAY[]::text[]
              )
            FROM workplace.design_images di
            CROSS JOIN LATERAL jsonb_array_elements(
              CASE 
                WHEN di.retouch IS NOT NULL AND di.retouch != '' AND jsonb_typeof(di.retouch::jsonb) = 'array'
                THEN di.retouch::jsonb
                ELSE '[]'::jsonb
              END
            ) AS item
            WHERE di.design_id = d.id 
              AND di.material_color = v.material_color
          )
        )
      ) AS variants
    FROM ecom.materialized_products p 
      INNER JOIN workplace.designs d ON p.design_id = d.id 
      ${collectionJoinEcomProductsClause}
      ${linkedCollectionJoinEcomProductsClause}

      INNER JOIN LATERAL (
        SELECT *
        FROM ecom.materialized_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
        ORDER BY v.fineness ${finenessOrder}, v.price DESC
      ) v ON TRUE
    WHERE 1 = 1
      AND p.haravan_product_type != 'Nhẫn Cưới' 
      ${filterString}
    GROUP BY 
      p.haravan_product_id, p.title, d.design_code, p.handle, p.ecom_title,
      d.diamond_holder, d.ring_band_type, p.haravan_product_type,
      p.max_price, p.min_price, p.max_price_18, p.max_price_14, 
      p.has_360
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
          AND p.haravan_product_type != 'Nhẫn Cưới'
          ${filterString}
        GROUP BY p.haravan_product_id
        ${havingString}
    ) AS subquery
  `;

  return { dataSql, countSql };
}
