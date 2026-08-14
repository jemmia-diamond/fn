import { Prisma } from "@prisma-cli";
import { toSqlOrder } from "services/utils/sql-helpers";

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
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(wr.products::jsonb) p
      WHERE (p->>'id')::bigint = ${weddingRingId}
        AND p->'images' IS NOT NULL
        AND jsonb_typeof(p->'images') = 'array'
        AND jsonb_array_length(p->'images') > 0
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
        COALESCE(
          (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', (p->>'id')::bigint,
                'product_type', p->>'product_type',
                'title', p->>'title',
                'ring_band_type', p->>'ring_band_type',
                'design_code', p->>'design_code',
                'diamond_holder', p->>'diamond_holder',
                'gender', p->>'gender',
                'handle', p->>'handle',
                'images', p->'images',
                'variants', COALESCE(
                  (
                    SELECT JSON_AGG(
                      JSON_BUILD_OBJECT(
                        'id', CAST(v.haravan_variant_id AS BIGINT),
                        'fineness', v.fineness,
                        'material_color', v.material_color,
                        'ring_size', v.ring_size,
                        'price', CAST(v.price AS DECIMAL),
                        'compare_at_price', CAST(v.price_compare_at AS DECIMAL),
                        'inventory_quantity', v.qty_available,
                        'available', COALESCE(v.qty_available > 0, false)
                      )
                      ORDER BY v.fineness DESC, v.price DESC
                    )
                    FROM marts_ecom.fct_ecom_jewelry_variants v
                    WHERE v.haravan_product_id = (p->>'id')::bigint
                  ),
                  '[]'::json
                )
              )
            )
            FROM jsonb_array_elements(wr.products::jsonb) p
            WHERE p->'images' IS NOT NULL
              AND jsonb_typeof(p->'images') = 'array'
              AND jsonb_array_length(p->'images') > 0
          ),
          '[]'::json
        ) AS products
    FROM marts_ecom.fct_ecom_wedding_rings wr
    WHERE 1 = 1
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(wr.products::jsonb) p
        WHERE p->'images' IS NOT NULL
          AND jsonb_typeof(p->'images') = 'array'
          AND jsonb_array_length(p->'images') > 0
      )
    ${filterSql}
    ${sortSql}
    ${paginationSql}
  `;
  return dataSql;
}

export function findCountSql({ filterSql }) {
  const countSql = Prisma.sql`
    SELECT 
      CAST(COUNT(DISTINCT wr.id) AS INT) AS total,
      (SELECT ARRAY_AGG(DISTINCT mwr.fineness) FROM marts_ecom.fct_ecom_wedding_rings mwr WHERE mwr.fineness NOT LIKE '%,%' ) AS fineness,
      (SELECT ARRAY_AGG(DISTINCT mwr.material_colors ) FROM marts_ecom.fct_ecom_wedding_rings mwr WHERE mwr.material_colors NOT LIKE '%,%' ) AS material_colors
    FROM marts_ecom.fct_ecom_wedding_rings wr
    WHERE 1 = 1
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(wr.products::jsonb) p
        WHERE p->'images' IS NOT NULL
          AND jsonb_typeof(p->'images') = 'array'
          AND jsonb_array_length(p->'images') > 0
      )
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
    const patterns = jsonParams.fineness.map((f) => `%${f}%`);
    filterSql = Prisma.sql`${filterSql} AND wr.fineness LIKE ANY(${patterns})\n`;
  }

  if (jsonParams.material_colors && jsonParams.material_colors.length > 0) {
    const patterns = jsonParams.material_colors.map((color) => `%${color}%`);
    filterSql = Prisma.sql`${filterSql} AND wr.material_colors LIKE ANY(${patterns})\n`;
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
  const order = toSqlOrder(jsonParams.sort?.order);

  const sortStrategies = {
    price: () => Prisma.sql`ORDER BY ${jsonParams.sort?.order === "asc" ? Prisma.raw("wr.min_price") : Prisma.raw("wr.max_price")} ${order}\n`,
    stock: () => Prisma.sql`ORDER BY wr.qty_onhand ${order}\n`,
    sold_quantity: () => Prisma.sql`ORDER BY COALESCE(wr.sold_quantity, 0) ${order}\n`,
    created_date: () => Prisma.sql`ORDER BY wr.id ${order}\n`
  };

  if (jsonParams.sort?.by && sortStrategies[jsonParams.sort.by]) {
    sortSql = sortStrategies[jsonParams.sort.by]();
  }

  if (jsonParams.product_ids && jsonParams.product_ids.length > 0) {
    const productIds = jsonParams.product_ids.map(id => typeof id === "string" ? BigInt(id) : id);
    filterSql = Prisma.sql`
      ${filterSql}
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(wr.products::jsonb) p
        WHERE (p->>'id')::bigint = ANY(${productIds})
          AND p->'images' IS NOT NULL
          AND jsonb_typeof(p->'images') = 'array'
          AND jsonb_array_length(p->'images') > 0
      )
    `;
  }

  return {
    filterSql,
    sortSql,
    paginationSql
  };
}
