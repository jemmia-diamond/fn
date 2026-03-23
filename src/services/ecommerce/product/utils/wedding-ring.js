import { Prisma } from "@prisma-cli";

export function buildWeddingRingsQuery(jsonParams) {
  const { filterSql, sortSql, paginationSql } = aggregateQuery(jsonParams);

  const dataSql = findDataSql({
    filterSql,
    sortSql,
    paginationSql
  });

  const countSql = findCountSql({
    filterSql
  });
  return {
    dataSql,
    countSql
  };
}

export function buildWeddingRingByIdQuery(weddingRingId) {
  const sortSql = Prisma.empty;
  const paginationSql = Prisma.empty;
  const filterSql = Prisma.sql`
    AND d.wedding_ring_id IN (
      SELECT
        d.wedding_ring_id 
      FROM workplace.products p 
        INNER JOIN workplace.designs d ON p.design_id = d.id 
      WHERE p.haravan_product_id = ${weddingRingId}
    )
  `;
  const dataSql = findDataSql({
    filterSql,
    sortSql,
    paginationSql
  });
  return dataSql;
}

export function findDataSql({ filterSql, sortSql, paginationSql }) {
  const dataSql = Prisma.sql`
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
    ${filterSql}
    GROUP BY wr.id, wr.title, wr.max_price, wr.min_price, wr.qty_onhand
    ${sortSql}
    ${paginationSql}
  `;
  return dataSql;
}

export function findCountSql({ filterSql }) {
  const countSql = Prisma.sql`
    SELECT 
      CAST(COUNT(DISTINCT wr.id) AS INT) AS total,
      (SELECT ARRAY_AGG(DISTINCT mwr.fineness) FROM ecom.materialized_wedding_rings mwr WHERE mwr.fineness NOT LIKE '%,%' ) AS fineness,
      (SELECT ARRAY_AGG(DISTINCT mwr.material_colors ) FROM ecom.materialized_wedding_rings mwr WHERE mwr.material_colors NOT LIKE '%,%' ) AS material_colors
    FROM workplace.products p 
      INNER JOIN workplace.designs d ON p.design_id = d.id 
      INNER JOIN ecom.materialized_wedding_rings wr ON d.wedding_ring_id = wr.id 
    WHERE 1 = 1
    ${filterSql}
  `;
  return countSql;
}

export function aggregateQuery(jsonParams) {
  let paginationSql = Prisma.empty;
  let sortSql = Prisma.empty;
  let filterSql = Prisma.empty;

  if (jsonParams.pagination) {
    paginationSql = Prisma.sql`LIMIT ${jsonParams.pagination.limit} `;
    if (jsonParams.pagination.from !== 1) {
      paginationSql = Prisma.sql`${paginationSql} OFFSET ${jsonParams.pagination.from - 1}\n`;
    }
  }

  if (jsonParams.fineness && jsonParams.fineness.length > 0) {
    filterSql = Prisma.sql`${filterSql} AND wr.fineness ~ ANY(${jsonParams.fineness})\n`;
  }

  if (jsonParams.material_colors && jsonParams.material_colors.length > 0) {
    filterSql = Prisma.sql`${filterSql} AND wr.material_colors ~ ANY(${jsonParams.material_colors})\n`;
  }

  if (jsonParams.is_in_stock) {
    filterSql = Prisma.sql`${filterSql} AND wr.qty_onhand > 0\n`;
  }

  if (jsonParams.price?.min) {
    filterSql = Prisma.sql`${filterSql} AND wr.min_price >= ${jsonParams.price.min}\n`;
  }

  if (jsonParams.price?.max) {
    filterSql = Prisma.sql`${filterSql} AND wr.max_price <= ${jsonParams.price.max}\n`;
  }

  if (jsonParams.sort) {
    if (jsonParams.sort.by === "price") {
      sortSql = Prisma.sql`ORDER BY ${jsonParams.sort.order === "asc" ? Prisma.raw("wr.min_price") : Prisma.raw("wr.max_price")} ${jsonParams.sort.order === "asc" ? Prisma.raw("ASC") : Prisma.raw("DESC")}\n`;
    } else if (jsonParams.sort.by === "stock") {
      sortSql = Prisma.sql`ORDER BY wr.qty_onhand ${jsonParams.sort.order === "asc" ? Prisma.raw("ASC") : Prisma.raw("DESC")}\n`;
    }
  }

  if (jsonParams.product_ids && jsonParams.product_ids.length > 0) {
    filterSql = Prisma.sql`
      ${filterSql}
            AND d.wedding_ring_id IN (
             SELECT
              d.wedding_ring_id 
              FROM workplace.products p 
              INNER JOIN workplace.designs d ON p.design_id = d.id 
             WHERE p.haravan_product_id = ANY(${jsonParams.product_ids})
            )
    `;
  }

  if (jsonParams.ring_band_styles && jsonParams.ring_band_styles.length > 0) {
    const normalizedBandStyles = jsonParams.ring_band_styles.map((style) =>
      style.trim().toLowerCase()
    );
    filterSql = Prisma.sql`
      ${filterSql} AND (
            (d.ring_band_style IS NOT NULL AND d.ring_band_style != '' AND POSITION(' - ' IN d.ring_band_style) > 0 AND LOWER(SPLIT_PART(d.ring_band_style, ' - ', 2)) = ANY(${normalizedBandStyles}))
            OR (d.ring_band_style IS NOT NULL AND d.ring_band_style != '' AND POSITION(' - ' IN d.ring_band_style) = 0 AND LOWER(d.ring_band_style) = ANY(${normalizedBandStyles}))
          )\n
    `;
  }

  if (
    jsonParams.excluded_ring_band_styles &&
    jsonParams.excluded_ring_band_styles.length > 0
  ) {
    const normalizedExcludedBandStyles =
      jsonParams.excluded_ring_band_styles.map((style) =>
        style.trim().toLowerCase()
      );
    filterSql = Prisma.sql`
      ${filterSql}
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
            )
    `;
  }

  return {
    filterSql,
    sortSql,
    paginationSql
  };
}
