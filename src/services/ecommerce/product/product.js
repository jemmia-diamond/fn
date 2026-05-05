import Database from "services/database";
import { retryQuery } from "services/utils/retry-utils";

import {
  buildQueryV2,
  buildQuerySingleV2
} from "services/ecommerce/product/utils/jewelry-v2";
import {
  buildWeddingRingByIdQuery,
  buildWeddingRingsQuery
} from "services/ecommerce/product/utils/wedding-ring";
import { JEWELRY_IMAGE } from "src/controllers/ecommerce/constant";

export default class ProductService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async searchJewelry(searchKey, limit, page) {
    if (!searchKey || typeof searchKey !== "string") {
      return [];
    }
    const lowerSearchKey = searchKey.toLowerCase();
    const likePattern = `%${lowerSearchKey}%`;
    const offset = (page - 1) * limit;

    const workplaceUrlPrefix = JEWELRY_IMAGE.WORKPLACE_URL_PREFIX;
    const workplaceFullUrl = JEWELRY_IMAGE.WORKPLACE_FULL_URL;
    const cdnUrl = JEWELRY_IMAGE.CDN_URL;

    const result = await this.db.$queryRaw`
      SELECT
        CAST(p.haravan_product_id AS DOUBLE PRECISION) AS id,
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
        var.variants
      FROM ecom.materialized_products p
        INNER JOIN workplace.designs d ON d.id = p.design_id
        LEFT JOIN workplace.ecom_360 e ON p.workplace_id = e.product_id


        -- Subquery for pre-aggregated variants with variant-level images
        INNER JOIN LATERAL (
          SELECT
            v.haravan_product_id,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', CAST(v.haravan_variant_id AS DOUBLE PRECISION),
                'fineness', v.fineness,
                'material_color', v.material_color,
                'ring_size', v.ring_size,
                'price', CAST(v.price AS DOUBLE PRECISION),
                'price_compare_at', CAST(v.price_compare_at AS DOUBLE PRECISION),
                'images', design_imgs.images
              )
            ) AS variants
          FROM ecom.materialized_variants v
    
          INNER JOIN LATERAL (
            SELECT 
              di.material_color,
              COALESCE(
                array_agg(
                  CASE 
                    WHEN item.value->>'url' LIKE ${workplaceUrlPrefix} || '%' THEN
                      REPLACE(item.value->>'url', ${workplaceFullUrl}, ${cdnUrl})
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
          ) design_imgs ON design_imgs.material_color = v.material_color AND cardinality(design_imgs.images) > 0

          WHERE v.haravan_product_id = p.haravan_product_id
          GROUP BY v.haravan_product_id
          HAVING COUNT(*) > 0
        ) var ON TRUE

      WHERE lower(concat(p.title, d.design_code, p.haravan_product_type)) LIKE ${likePattern}
      LIMIT ${limit}
      OFFSET ${offset};
    `;
    return result;
  }

  async getDiamondProfileImage(gia_no) {
    const result = await this.db.$queryRaw`
      SELECT propimg
      FROM gia.report_no_data
      WHERE report_no = ${gia_no};
    `;
    return result?.[0] || null;
  }

  async getWeddingRingsData(jsonParams) {
    const { dataSql, countSql } = buildWeddingRingsQuery(jsonParams);

    const data = await retryQuery(() => this.db.$queryRaw(dataSql));
    const count = await retryQuery(() => this.db.$queryRaw(countSql));

    return {
      data,
      count: count.length ? Number(count[0].total) : 0,
      material_colors: count.length ? count[0].material_colors : [],
      fineness: count.length ? count[0].fineness : []
    };
  }

  async getWeddingRings(jsonParams) {
    const { data, count, material_colors, fineness } =
      await this.getWeddingRingsData(jsonParams);
    return {
      data,
      metadata: {
        total: count,
        pagination: jsonParams.pagination,
        material_colors: material_colors,
        fineness: fineness
      }
    };
  }

  async getWeddingRingById(id) {
    const dataSql = buildWeddingRingByIdQuery(id);
    const data = await this.db.$queryRaw(dataSql);
    return data?.[0] || null;
  }

  async get3dMetadataByJewelryId(productId) {
    const id = BigInt(productId);

    const products = await this.db.$queryRaw`
      SELECT 
        p.haravan_product_id AS product_id,
        CONCAT('glb/', e.file_name) AS path_to_3dm
      FROM workplace.products p 
          INNER JOIN workplace.ecom_360 e ON p.id = e.product_id
      WHERE p.haravan_product_id = ${id}
    `;

    if (!products || products.length === 0) return null;

    const item = products[0];

    return {
      product_id: Number(item.product_id),
      path_to_3dm: item.path_to_3dm
    };
  }

  static async refreshMaterializedViews(env) {
    const db = Database.instance(env);
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_products;`;
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_variants;`;
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_wedding_rings;`;
  }

  async getJewelryDataV2(jsonParams) {
    const { dataSql, countSql } = buildQueryV2(jsonParams);

    const data = await retryQuery(() => this.db.$queryRaw`${dataSql}`);
    const count = await retryQuery(() => this.db.$queryRaw`${countSql}`);

    return {
      data,
      count: count.length ? Number(count[0].total) : 0,
      material_colors: count.length ? count[0].material_colors : [],
      fineness: count.length ? count[0].fineness : []
    };
  }

  async getJewelryV2(jsonParams) {
    const { data, count, material_colors, fineness } =
      await this.getJewelryDataV2(jsonParams);
    return {
      data,
      metadata: {
        total: count,
        material_colors: material_colors,
        fineness: fineness,
        pagination: jsonParams.pagination
      }
    };
  }

  async getJewelryByIdV2(id, params = {}) {
    const productId = parseInt(id, 10);
    const { variantJsonBuildObject, lateralJoinClause } =
      buildQuerySingleV2(params);
    const workplaceUrlPrefix = JEWELRY_IMAGE.WORKPLACE_URL_PREFIX;
    const workplaceFullUrl = JEWELRY_IMAGE.WORKPLACE_FULL_URL;
    const cdnUrl = JEWELRY_IMAGE.CDN_URL;

    const result = await retryQuery(() => this.db.$queryRaw`
      SELECT
        CAST(p.haravan_product_id AS INT) AS id,
        p.title,
        d.design_code,
        p.handle,
        d.diamond_holder,
        CASE
          WHEN d.ring_band_type = 'None' THEN NULL
          ELSE d.ring_band_type
        END AS ring_band_type,
        d.main_stone,
        d.stone_quantity,
        p.haravan_product_type AS product_type,
        'Round' AS shape_of_main_stone,
        p.has_360,
        p.estimated_gold_weight,
        JSON_AGG(
          ${variantJsonBuildObject}
        ) AS variants,
        JSON_BUILD_OBJECT(
          'name', p.primary_collection,
          'handle', p.primary_collection_handle
        ) AS primary_collection
      FROM ecom.materialized_products p
        INNER JOIN workplace.designs d ON d.id = p.design_id

        ${lateralJoinClause}

        LEFT JOIN LATERAL (
          SELECT 
            di.material_color,
            COALESCE(
              array_agg(
                CASE 
                  WHEN item.value->>'url' LIKE ${workplaceUrlPrefix} || '%' THEN
                    REPLACE(item.value->>'url', ${workplaceFullUrl}, ${cdnUrl})
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

        WHERE 1 = 1
          AND p.haravan_product_id = ${productId}
        GROUP BY
          p.haravan_product_id, p.title, d.design_code, p.handle,
          d.diamond_holder, d.ring_band_type, d.main_stone, d.stone_quantity, p.haravan_product_type,
          p.max_price, p.min_price, p.max_price_18, p.max_price_14,
          p.qty_onhand, p.has_360, p.estimated_gold_weight,
          p.primary_collection, p.primary_collection_handle
    `);
    return result?.[0] || null;
  }
}
