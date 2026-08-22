import Database from "services/database";
import {
  buildInventoryMetricsSql,
  buildJewelryPriceSql,
  buildQuerySingleV2,
  buildQueryV2
} from "services/ecommerce/product/utils/jewelry-v2";
import {
  buildWeddingRingByIdQuery,
  buildWeddingRingsQuery,
  filterWeddingRingVariants
} from "services/ecommerce/product/utils/wedding-ring";
import { retryQuery } from "services/utils/retry-utils";
import { API_CONFIG } from "src/controllers/ecommerce/constant";

export default class ProductService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async searchJewelry(searchKey, limit, page, options = {}) {
    if (!searchKey || typeof searchKey !== "string") {
      return [];
    }
    const lowerSearchKey = searchKey.toLowerCase();
    const likePattern = `%${lowerSearchKey}%`;
    const offset = (page - 1) * limit;

    const priceField = buildJewelryPriceSql(options.default_jewelry_discount);

    const result = await this.db.$queryRaw`
      SELECT
        CAST(p.haravan_product_id AS DOUBLE PRECISION) AS id,
        p.title,
        p.design_code,
        p.handle,
        p.diamond_holder,
        p.ring_band_type,
        p.haravan_product_type AS product_type,
        p.has_360${buildInventoryMetricsSql(options)},
        var.variants
      FROM marts_ecom.fct_ecom_jewelry_products p

        INNER JOIN LATERAL (
          SELECT
            v.haravan_product_id,
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', CAST(v.haravan_variant_id AS DOUBLE PRECISION),
                'fineness', v.fineness,
                'material_color', v.material_color,
                'ring_size', v.ring_size,
                'price', CAST(${priceField} AS DOUBLE PRECISION),
                'price_compare_at', CAST(v.price_compare_at AS DOUBLE PRECISION),
                'images', COALESCE(v.images, ARRAY[]::text[])
              )
            ) AS variants
          FROM marts_ecom.fct_ecom_jewelry_variants v
          WHERE v.haravan_product_id = p.haravan_product_id
          GROUP BY v.haravan_product_id
          HAVING COUNT(*) > 0
        ) var ON TRUE

      WHERE lower(concat(p.title, p.design_code, p.haravan_product_type)) LIKE ${likePattern}
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

    const filteredData = (data || []).map(filterWeddingRingVariants);

    return {
      data: filteredData,
      count: count.length ? Number(count[0].total) : 0,
      material_colors: count.length ? count[0].material_colors : [],
      fineness: count.length ? count[0].fineness : []
    };
  }

  async getWeddingRings(jsonParams) {
    const { data, count, material_colors, fineness } = await this.getWeddingRingsData(jsonParams);
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
    return data?.[0] ? filterWeddingRingVariants(data[0]) : null;
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

  async getJewelryDataV2(jsonParams) {
    const { dataSql, countSql } = buildQueryV2(jsonParams);

    const data = await retryQuery(() => this.db.$queryRaw(dataSql));
    const count = await retryQuery(() => this.db.$queryRaw(countSql));

    return {
      data,
      count: count.length ? Number(count[0].total) : 0,
      material_colors: count.length ? count[0].material_colors : [],
      fineness: count.length ? count[0].fineness : []
    };
  }

  async getJewelryV2(jsonParams) {
    const { data, count, material_colors, fineness } = await this.getJewelryDataV2(jsonParams);
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

  async getSetByIdV2(id, options = {}) {
    const setProducts = await this.db.$queryRaw`
      SELECT 
        s.haravan_product_id, 
        s.set_name as title, 
        array_remove(array_agg(ds.design_id), NULL) as design_ids
      FROM workplace.sets s
      LEFT JOIN workplace.design_set ds ON ds.set_id = s.id
      WHERE s.haravan_product_id = ${parseInt(id)}
      GROUP BY s.id
    `;

    if (!setProducts || setProducts.length === 0) {
      return null;
    }

    const setProduct = setProducts[0];
    const designIds = (setProduct.design_ids || []).filter((dId) => dId != null);

    let linkedProductsData = [];
    if (designIds.length > 0) {
      const jsonParams = {
        design_ids: designIds,
        pagination: { from: API_CONFIG.MIN_FROM, limit: API_CONFIG.MAX_LIMIT },
        ...options
      };
      const linkedProducts = await this.getJewelryV2(jsonParams);
      linkedProductsData = linkedProducts.data;
    }

    return {
      id: setProduct.haravan_product_id,
      title: setProduct.title,
      product_type: "Bộ Trang Sức Kim Cương",
      linked_products: linkedProductsData
    };
  }

  async getJewelryByIdV2(id, options = {}) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) return null;
    const { variantJsonBuildObject, lateralJoinClause } = buildQuerySingleV2(options);

    const result = await retryQuery(
      () => this.db.$queryRaw`
      SELECT
        CAST(p.haravan_product_id AS INT) AS id,
        p.title,
        p.design_code,
        p.handle,
        p.diamond_holder,
        CASE
          WHEN p.ring_band_type = 'None' THEN NULL
          ELSE p.ring_band_type
        END AS ring_band_type,
        p.main_stone,
        p.stone_quantity,
        p.haravan_product_type AS product_type,
        'Round' AS shape_of_main_stone,
        p.has_360,
        p.estimated_gold_weight${buildInventoryMetricsSql(options)},
        JSON_AGG(
          ${variantJsonBuildObject}
        ) AS variants,
        JSON_BUILD_OBJECT(
          'name', p.primary_collection,
          'handle', p.primary_collection_handle
        ) AS primary_collection
      FROM marts_ecom.fct_ecom_jewelry_products p

        ${lateralJoinClause}

        WHERE 1 = 1
          AND p.haravan_product_id = ${productId}
        GROUP BY
          p.haravan_product_id, p.title, p.design_code, p.handle,
          p.diamond_holder, p.ring_band_type, p.main_stone, p.stone_quantity, p.haravan_product_type,
          p.max_price, p.min_price, p.max_price_18, p.max_price_14,
          p.qty_onhand, p.has_360, p.estimated_gold_weight,
          p.primary_collection, p.primary_collection_handle, p.sold_quantity
    `
    );
    return result?.[0] || null;
  }
}
