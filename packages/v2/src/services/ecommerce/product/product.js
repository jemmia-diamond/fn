import Database from "services/database";
import { Prisma } from "@prisma-cli";
import { buildQuerySingle, buildQuery } from "services/ecommerce/product/utils/jewelry";
import { buildQueryV2 } from "services/ecommerce/product/utils/jewelry-v2";
import { buildWeddingRingsQuery } from "services/ecommerce/product/utils/wedding-ring";
import { JEWELRY_IMAGE } from "src/controllers/ecommerce/constant";
import * as Sentry from "@sentry/cloudflare";

export default class ProductService {
  constructor(env) {
    this.db = Database.instance(env, "neon");
  }

  async getJewelryData(jsonParams) {
    try {
      const { dataSql, countSql } = buildQuery(jsonParams);

      const data = await this.db.$queryRaw`${Prisma.raw(dataSql)}`;
      const count = await this.db.$queryRaw`${Prisma.raw(countSql)}`;

      return {
        data,
        count: count.length ? Number(count[0].total) : 0,
        material_colors: count.length ? count[0].material_colors : [],
        fineness: count.length ? count[0].fineness : []
      };
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }

  async getJewelry(jsonParams) {
    const { data, count, material_colors, fineness } =
      await this.getJewelryData(jsonParams);
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

  async searchJewelry(searchKey, limit, page) {
    const lowerSearchKey = searchKey.toLowerCase();
    const likePattern = `%${lowerSearchKey}%`;
    const offset = (page - 1) * limit;
    const result = await this.db.$queryRaw`
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
        var.variants
      FROM ecom.materialized_products p
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

        -- Subquery for pre-aggregated variants
        INNER JOIN (
          SELECT
            v.haravan_product_id,
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
          FROM ecom.materialized_variants v
          GROUP BY v.haravan_product_id
        ) var ON var.haravan_product_id = p.haravan_product_id

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

    const data = await this.db.$queryRaw`${Prisma.raw(dataSql)}`;
    const count = await this.db.$queryRaw`${Prisma.raw(countSql)}`;

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

  async getJewelryById(id, params) {
    const { variantJsonBuildObject, lateralJoinClause } = buildQuerySingle(params);
    const dataSql = `
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
          img.images,
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
          INNER JOIN (
            SELECT
              i.product_id,
              array_agg(i.src ORDER BY i.src) AS images
            FROM haravan.images i
            GROUP BY i.product_id
          ) img ON img.product_id = p.haravan_product_id

          ${lateralJoinClause}
        WHERE 1 = 1
          AND p.haravan_product_id = ${id}
        GROUP BY
        	p.haravan_product_id, p.title, d.design_code, p.handle,
          d.diamond_holder, d.ring_band_type, d.main_stone, d.stone_quantity, p.haravan_product_type,
          p.max_price, p.min_price, p.max_price_18, p.max_price_14,
          p.qty_onhand, img.images, p.has_360, p.estimated_gold_weight,
          p.primary_collection, p.primary_collection_handle
    `;
    const result = await this.db.$queryRaw`${Prisma.raw(dataSql)}`;
    return result?.[0] || null;
  }

  static async refreshMaterializedViews(env) {
    const db = Database.instance(env);
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_products;`;
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_variants;`;
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_wedding_rings;`;
  }

  async getJewelryDataV2(jsonParams) {
    const { dataSql, countSql } = buildQueryV2(jsonParams);

    const data = await this.db.$queryRaw`${Prisma.raw(dataSql)}`;
    const count = await this.db.$queryRaw`${Prisma.raw(countSql)}`;

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

  async getJewelryByIdV2(id) {
    const productId = parseInt(id, 10);
    const workplaceUrlPrefix = JEWELRY_IMAGE.WORKPLACE_URL_PREFIX;
    const workplaceFullUrl = JEWELRY_IMAGE.WORKPLACE_FULL_URL;
    const cdnUrl = JEWELRY_IMAGE.CDN_URL;

    const result = await this.db.$queryRaw`
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
        img.images,
        p.estimated_gold_weight,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', CAST(v.haravan_variant_id AS INT),
            'fineness', v.fineness,
            'material_color', v.material_color,
            'ring_size', v.ring_size,
            'price', CAST(v.price AS INT),
            'price_compare_at', CAST(v.price_compare_at AS INT),
             'applique_material', v.applique_material,
             'estimated_gold_weight', v.estimated_gold_weight,
             'images', (
               SELECT 
                 COALESCE(
                   array_agg(
                     CASE 
                       WHEN item.value->>'url' LIKE ${workplaceUrlPrefix} || '.%' THEN
                         REPLACE(item.value->>'url', ${workplaceFullUrl}, ${cdnUrl})
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
        ) AS variants,
        JSON_BUILD_OBJECT(
             'name', p.primary_collection,
             'handle', p.primary_collection_handle
      	) AS primary_collection
      FROM ecom.materialized_products p
        INNER JOIN workplace.designs d ON d.id = p.design_id
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
          ORDER BY v.fineness, v.price DESC
        ) v ON TRUE
      WHERE 1 = 1
        AND p.haravan_product_id = ${productId}
      GROUP BY
      	p.haravan_product_id, p.title, d.design_code, p.handle,
        d.diamond_holder, d.ring_band_type, d.main_stone, d.stone_quantity, p.haravan_product_type,
        p.max_price, p.min_price, p.max_price_18, p.max_price_14,
        p.qty_onhand, img.images, p.has_360, p.estimated_gold_weight,
        p.primary_collection, p.primary_collection_handle
    `;
    return result?.[0] || null;
  }
}
