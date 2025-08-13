export function buildWeddingRingsQuery(jsonParams) {
  const {filterString, sortString, paginationString} = aggregateQuery(jsonParams);

  const dataSql = `
    SELECT 
        wr.id,
        wr.title,
        json_agg(
            json_build_object(
                'id', p.haravan_product_id,
                'product_type', p.haravan_product_type,
                'title', p.ecom_title,
                'ring_band_type', CASE 
                                        WHEN d.ring_band_type = 'None' THEN NULL
                                    ELSE d.ring_band_type
                                    END,
                'design_code', d.design_code,
                'diamond_holder', d.diamond_holder,
                'gender', d.gender,
                'handle', p.handle ,
                'variants', (
                    SELECT json_agg(
                        json_build_object(
                            'id', v.haravan_variant_id,
                            'fineness', v.fineness,
                            'material_color', v.material_color,
                            'ring_size', v.ring_size,
                            'price', vvv.price,
                            'compare_at_price', vvv.price_compare_at ,
                            'inventory_quantity', vv.qty_available,
                            'title', vv.title,
                            'available', vv.qty_available > 0
                        )
                    )
                    FROM workplace.variants v
                        INNER JOIN haravan.variants vv ON v.haravan_variant_id = vv.id 
                        INNER JOIN ecom.variants vvv ON v.haravan_variant_id = vvv.haravan_variant_id
                    WHERE v.product_id = p.id
                ),
                'images', (
                    SELECT array_agg(i.src ORDER BY i.src)
                    FROM haravan.images i 
                    WHERE i.product_id = p.haravan_product_id
                )
            )
        ) AS products
    FROM workplace.products p 
        INNER JOIN workplace.designs d ON p.design_id = d.id 
        INNER JOIN ecom.materialized_wedding_rings wr ON d.wedding_ring_id = wr.id 
    WHERE 1 = 1

    GROUP BY wr.id, wr.title
    ${paginationString}
  `;

  const countSql = `
      SELECT CAST(COUNT(*) OVER() AS INT) AS total
      FROM workplace.products p 
        INNER JOIN workplace.designs d ON p.design_id = d.id 
        INNER JOIN ecom.wedding_rings wr ON d.wedding_ring_id = wr.id 
      GROUP BY wr.id, wr.title, wr.image_updated_at
      LIMIT 1
    `;

  return {
    dataSql,
    countSql
  };
}

export function aggregateQuery(jsonParams) {
  let paginationString = "";
  let sortString = "";
  let filterString = "";

  if (jsonParams.pagination) {
    paginationString += `LIMIT ${jsonParams.pagination.limit} `;
    if (jsonParams.pagination.from !== 1) {
      paginationString += `OFFSET ${jsonParams.pagination.from - 1}\n`;
    }
  }

  if (jsonParams.fineness && jsonParams.fineness.length > 0) {
    filterString += `AND v.fineness LIKE '%${jsonParams.fineness.join(", ")}%'\n`;
  }

  if (jsonParams.material_colors && jsonParams.material_colors.length > 0) {
    filterString += `AND v.material_color LIKE '%${jsonParams.material_colors.join(", ")}%'\n`;
  }

  return {
    filterString,
    sortString,
    paginationString
  };
}
