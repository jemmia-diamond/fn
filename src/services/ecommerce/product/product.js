import Database from "services/database";
import { Prisma } from "@prisma-cli";
import { buildQuery } from "services/ecommerce/product/utils/jewelry";
import { buildWeddingRingsQuery } from "services/ecommerce/product/utils/wedding-ring";

export default class ProductService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async getJewelryData(jsonParams) {
    const {dataSql, countSql} = buildQuery(jsonParams);

    const [data, count] = await Promise.all([
      this.db.$queryRaw`${Prisma.raw(dataSql)}`,
      this.db.$queryRaw`${Prisma.raw(countSql)}`
    ]);

    return {
      data,
      count: count.length ? Number(count[0].total) : 0
    };
  }

  async getJewelry(jsonParams) {
    const {data, count} = await this.getJewelryData(jsonParams);
    return {
      data,
      metadata: {
        total: count,
        pagination: jsonParams.pagination
      }
    };
  }

  async searchJewelry(searchKey, limit) {
    const lowerSearchKey = searchKey.toLowerCase();
    const likePattern = `%${lowerSearchKey}%`;
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

        -- Subquery for pre-aggregated variants
        INNER JOIN (
          SELECT
            v.hararvan_product_id,
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
          FROM ecom.variants v
          GROUP BY v.hararvan_product_id
        ) var ON var.hararvan_product_id = p.haravan_product_id

      WHERE lower(concat(p.title, d.design_code, p.haravan_product_type)) LIKE ${likePattern}
      LIMIT ${limit};
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
    const {dataSql, countSql} = buildWeddingRingsQuery(jsonParams);

    const [data, count] = await Promise.all([
      this.db.$queryRaw`${Prisma.raw(dataSql)}`,
      this.db.$queryRaw`${Prisma.raw(countSql)}`
    ]);

    return {
      data,
      count: count.length ? Number(count[0].total) : 0
    };
  }

  async getWeddingRings(jsonParams) {
    const {data, count} = await this.getWeddingRingsData(jsonParams);
    return {
      data,
      metadata: {
        total: count,
        pagination: jsonParams.pagination
      }
    };
  }

  async getJewelryById(id) {
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
            'applique_material', v.applique_material
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
	      AND p.haravan_product_id = ${id}
	    GROUP BY
	    	p.haravan_product_id, p.title, d.design_code, p.handle,
	      d.diamond_holder, d.ring_band_type, p.haravan_product_type,
	      p.max_price, p.min_price, p.max_price_18, p.max_price_14,
	      p.qty_onhand, img.images, p.has_360, p.estimated_gold_weight,
	      p.primary_collection, p.primary_collection_handle
    `;
    return result?.[0] || null;
  }

  static async refreshMaterializedViews(env) {
    const db = Database.instance(env);
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_products;`;
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_variants;`;
    await db.$queryRaw`REFRESH MATERIALIZED VIEW ecom.materialized_wedding_rings;`;
  }
}
