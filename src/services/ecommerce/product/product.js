import Database from "services/database";
import { buildQuery } from "./utils/jewelry";

export default class ProductService {
  constructor(env) {
    this.db = Database.instance(env);
  }

  async getJewelryData(jsonParams) {
    const {dataSql, countSql} = buildQuery(jsonParams);

    const [data, count] = await Promise.all([
      this.db.$queryRawUnsafe(dataSql),
      this.db.$queryRawUnsafe(countSql)
    ]);

    return {
      data,
      count: Number(count[0].total)
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
      array_agg(i.src ORDER BY i.src) AS images,
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
    FROM ecom.products p
      INNER JOIN workplace.designs d ON d.id = p.design_id
      LEFT JOIN workplace.ecom_360 e ON p.workplace_id = e.product_id
      INNER JOIN haravan.images i ON i.product_id = p.haravan_product_id
      INNER JOIN LATERAL (
        SELECT *
        FROM ecom.variants v
        WHERE v.hararvan_product_id = p.haravan_product_id
      ) v ON TRUE
    WHERE 1 = 1
    AND lower(concat(p.title, d.design_code, p.haravan_product_type )) LIKE ${likePattern}
    GROUP BY 
      p.haravan_product_id, p.title, d.design_code, p.handle, 
      d.diamond_holder, d.ring_band_type, p.haravan_product_type,
      CASE WHEN e.product_id IS NULL THEN FALSE ELSE TRUE END,
      p.max_price, p.min_price, p.max_price_18, p.max_price_14, 
      p.qty_onhand, p.image_updated_at
    LIMIT ${limit};
    `;
    return result;
  }
}
