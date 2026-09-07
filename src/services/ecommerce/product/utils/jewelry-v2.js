import { aggregateQuery } from "services/ecommerce/product/utils/jewelry";
import { API_CONFIG } from "src/controllers/ecommerce/constant";
import { Prisma } from "@prisma-cli";

export function getDiscountMultiplier(customDiscount, fallbackPercent = 0) {
  const percent = Number(customDiscount ?? fallbackPercent);
  const safePercent =
    Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : 0;
  return (100 - safePercent) / 100;
}

export function buildJewelryPriceSql(discountParam) {
  const defaultJewelryMultiplier = getDiscountMultiplier(discountParam);
  return Prisma.sql`
    CASE
      WHEN v.price < v.price_compare_at THEN CAST(v.price AS DECIMAL)
      ELSE CAST(v.price_compare_at * ${defaultJewelryMultiplier} AS DECIMAL)
    END
  `;
}

export function buildInventoryMetricsSql(opts = {}) {
  if (!opts.return_inventory_metrics) {
    return Prisma.sql``;
  }
  const limitSql =
    opts.limit_selling_quantity !== null &&
    opts.limit_selling_quantity !== undefined
      ? Prisma.sql`CAST(${opts.limit_selling_quantity} AS INT)`
      : Prisma.sql`NULL`;
  return Prisma.sql`
    , CAST(COALESCE(p.sold_quantity, 0) AS INT) AS sold_quantity, ${limitSql} AS limit_selling_quantity
  `;
}

function buildBaseQueryV2(jsonParams) {
  const {
    filterSql,
    sortSql,
    paginationSql,
    handleFinenessPriority,
    collectionJoinEcomProductsClause,
    linkedCollectionJoinEcomProductsClause,
    havingSql,
    warehouseJoinClause
  } = aggregateQuery(jsonParams);

  const finenessOrder = handleFinenessPriority === "14K" ? "ASC" : "DESC";

  const priceField = buildJewelryPriceSql(jsonParams.default_jewelry_discount);

  let lateralJoinClause;
  let variantJsonBuildObject;

  if (jsonParams.matched_diamonds) {
    // V2 with matched diamonds support
    variantJsonBuildObject = Prisma.sql`
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', ${priceField},
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'diamonds', COALESCE(v.diamonds::jsonb, '[]'::jsonb),
        'images', COALESCE(v.images, ARRAY[]::text[])
      )
    `;

    lateralJoinClause = Prisma.sql`
      INNER JOIN LATERAL (
        SELECT *
        FROM marts_ecom.fct_ecom_jewelry_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
          AND v.images IS NOT NULL AND cardinality(v.images) > 0
        ORDER BY v.fineness ${Prisma.raw(finenessOrder)}, v.price DESC
      ) v ON TRUE
    `;
  } else {
    // V2 without matched diamonds
    variantJsonBuildObject = Prisma.sql`
      JSON_BUILD_OBJECT(
        'id', CAST(v.haravan_variant_id AS INT),
        'fineness', v.fineness,
        'material_color', v.material_color,
        'ring_size', v.ring_size,
        'price', ${priceField},
        'price_compare_at', CAST(v.price_compare_at AS DECIMAL),
        'qty_available', v.qty_available,
        'qty_onhand', v.qty_onhand,
        'images', COALESCE(v.images, ARRAY[]::text[])
      )
    `;

    lateralJoinClause = Prisma.sql`
      INNER JOIN LATERAL (
        SELECT *
        FROM marts_ecom.fct_ecom_jewelry_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
          AND v.images IS NOT NULL AND cardinality(v.images) > 0
        ORDER BY v.fineness ${Prisma.raw(finenessOrder)}, v.price DESC
      ) v ON TRUE
    `;
  }

  const dataSql = Prisma.sql`
    SELECT
      CAST(p.haravan_product_id AS INT) AS id,
      p.title,
      p.design_code,
      p.handle,
      p.diamond_holder,
      p.main_stone,
      p.ring_band_type,
      p.haravan_product_type AS product_type,
      p.has_360${buildInventoryMetricsSql(jsonParams)},
      JSON_AGG(
        ${variantJsonBuildObject}
      ) AS variants
    FROM marts_ecom.fct_ecom_jewelry_products p
      ${Prisma.raw(collectionJoinEcomProductsClause)}
      ${Prisma.raw(linkedCollectionJoinEcomProductsClause)}

      ${lateralJoinClause}
      ${Prisma.raw(warehouseJoinClause)}
    WHERE 1 = 1
      AND p.haravan_product_type != 'Nhẫn Cưới'
      AND p.design_id IS NOT NULL
      AND (v.images IS NOT NULL AND cardinality(v.images) > 0)
      ${filterSql}
    GROUP BY
      p.haravan_product_id, p.title, p.design_code, p.handle,
      p.diamond_holder, p.main_stone, p.ring_band_type, p.haravan_product_type,
      p.max_price, p.min_price, p.max_price_18, p.max_price_14,
      p.has_360, p.sold_before_2025, p.sold_quantity, p.created_date ${collectionJoinEcomProductsClause ? Prisma.raw(", p2.image_updated_at") : Prisma.empty}

    ${havingSql}
    ${sortSql}
    ${paginationSql}
  `;

  const countSql = Prisma.sql`
    SELECT
      COUNT(DISTINCT sub.haravan_product_id) AS total,
      ARRAY_AGG(DISTINCT sub.material_color) FILTER (WHERE sub.material_color IS NOT NULL) AS material_colors,
      ARRAY_AGG(DISTINCT sub.fineness) FILTER (WHERE sub.fineness IS NOT NULL) AS fineness
    FROM (
      SELECT p.haravan_product_id, v.material_color, v.fineness
      FROM marts_ecom.fct_ecom_jewelry_products p
        ${lateralJoinClause}
        ${Prisma.raw(collectionJoinEcomProductsClause)}
        ${Prisma.raw(linkedCollectionJoinEcomProductsClause)}
        ${Prisma.raw(warehouseJoinClause)}
      WHERE 1 = 1
        AND p.haravan_product_type != 'Nhẫn Cưới'
        AND p.design_id IS NOT NULL
        AND (v.images IS NOT NULL AND cardinality(v.images) > 0)
        ${filterSql}
    ) AS sub
  `;

  return { dataSql, countSql };
}

export function buildInterleavedQueryV2(jsonParams) {
  const productTypes = jsonParams.product_types || [];
  const blockSize = jsonParams.block_size;

  const from = jsonParams.pagination?.from - API_CONFIG.MIN_FROM;
  const limit = jsonParams.pagination?.limit;
  const to = from + limit;

  const queries = productTypes.map((type, typeIdx) => {
    const singleTypeParams = {
      ...jsonParams,
      product_types: [type],
      pagination: {
        from: API_CONFIG.MIN_FROM,
        limit: to
      }
    };
    if (jsonParams.genders && jsonParams.genders.length > 0) {
      if (type.includes("Nữ") && jsonParams.genders.includes("Nữ")) {
        singleTypeParams.genders = ["Nữ"];
      } else if (type.includes("Nam") && jsonParams.genders.includes("Nam")) {
        singleTypeParams.genders = ["Nam"];
      }
    }
    const { dataSql: subDataSql } = buildBaseQueryV2(singleTypeParams);
    return { subDataSql, typeIdx };
  });

  const unionSql = Prisma.join(
    queries.map(
      (q) => Prisma.sql`
      SELECT *,
             ROW_NUMBER() OVER () as row_num,
             ${q.typeIdx}::integer as type_idx
      FROM (${q.subDataSql}) AS sub_t
    `
    ),
    " UNION ALL "
  );

  const dataSql = Prisma.sql`
    SELECT * FROM (
      ${unionSql}
    ) AS ranked
    ORDER BY (row_num - ${API_CONFIG.ROW_NUM_START_INDEX}) / ${blockSize}::integer ASC, type_idx ASC, row_num ASC
    LIMIT ${limit} OFFSET ${from}
  `;

  const countQueries = productTypes.map((type) => {
    const singleTypeParams = {
      ...jsonParams,
      product_types: [type]
    };
    if (jsonParams.genders && jsonParams.genders.length > 0) {
      if (type.includes("Nữ") && jsonParams.genders.includes("Nữ")) {
        singleTypeParams.genders = ["Nữ"];
      } else if (type.includes("Nam") && jsonParams.genders.includes("Nam")) {
        singleTypeParams.genders = ["Nam"];
      }
    }
    const { countSql: subCountSql } = buildBaseQueryV2(singleTypeParams);
    return subCountSql;
  });

  const countSql = Prisma.sql`
    SELECT
      COALESCE(SUM(sub_c.total), 0)::bigint AS total,
      (
        SELECT ARRAY_AGG(DISTINCT color) FILTER (WHERE color IS NOT NULL)
        FROM (
          SELECT UNNEST(c_t.material_colors) AS color
          FROM (${Prisma.join(
            countQueries.map(
              (c) => Prisma.sql`SELECT material_colors FROM (${c}) AS sub_m`
            ),
            " UNION ALL "
          )}) AS c_t
        ) AS colors_sub
      ) AS material_colors,
      (
        SELECT ARRAY_AGG(DISTINCT f) FILTER (WHERE f IS NOT NULL)
        FROM (
          SELECT UNNEST(c_t.fineness) AS f
          FROM (${Prisma.join(
            countQueries.map(
              (c) => Prisma.sql`SELECT fineness FROM (${c}) AS sub_f`
            ),
            " UNION ALL "
          )}) AS c_t
        ) AS fineness_sub
      ) AS fineness
    FROM (
      ${Prisma.join(
        countQueries.map(
          (c) => Prisma.sql`SELECT c_t.total FROM (${c}) AS c_t`
        ),
        " UNION ALL "
      )}
    ) AS sub_c
  `;

  return { dataSql, countSql };
}

export function buildQueryV2(jsonParams) {
  const productTypes = jsonParams.product_types || [];
  const blockSize = jsonParams.block_size;

  if (blockSize && blockSize > 0 && productTypes.length > 1) {
    return buildInterleavedQueryV2(jsonParams);
  }

  return buildBaseQueryV2(jsonParams);
}

export function buildQuerySingleV2(params = {}) {
  const priceField = buildJewelryPriceSql(params.default_jewelry_discount);

  let lateralJoinClause;
  let variantJsonBuildObject;

  if (params.matched_diamonds) {
    // With matched diamonds
    variantJsonBuildObject = Prisma.sql`
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
        'diamonds', COALESCE(v.diamonds::jsonb, '[]'::jsonb),
        'images', COALESCE(v.images, ARRAY[]::text[])
      )
    `;

    lateralJoinClause = Prisma.sql`
      LEFT JOIN LATERAL (
        SELECT *
        FROM marts_ecom.fct_ecom_jewelry_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
          AND v.images IS NOT NULL AND cardinality(v.images) > 0
        ORDER BY v.fineness, v.price DESC
      ) v ON TRUE
    `;
  } else {
    // Without matched diamonds
    variantJsonBuildObject = Prisma.sql`
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
        'images', COALESCE(v.images, ARRAY[]::text[])
      )
    `;

    lateralJoinClause = Prisma.sql`
      LEFT JOIN LATERAL (
        SELECT *
        FROM marts_ecom.fct_ecom_jewelry_variants v
        WHERE v.haravan_product_id = p.haravan_product_id
          AND v.images IS NOT NULL AND cardinality(v.images) > 0
        ORDER BY v.fineness, v.price DESC
      ) v ON TRUE
    `;
  }

  return { variantJsonBuildObject, lateralJoinClause };
}
