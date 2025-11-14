import Database from "services/database";
import { Prisma } from "@prisma-cli";

export default class ProductSearchService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env, "neon");
  }

  /**
   * Search products for Salesaya chatbot
   *
   * @param {string} searchKey - Search keyword (keyword or code)
   * @param {number} limit - Number of results per page
   * @param {number} page - Page number (1-based)
   * @param {number} priceFrom - Minimum price filter (optional)
   * @param {number} priceTo - Maximum price filter (optional)
   * @returns {Promise<Array>} Product list with format:
      name: string,
      sku: string,
      variant_title: string,
      barcode: string,
      price: number,
      link_haravan: string,
      link_website: string,
      inventory: Array,
      image_urls: Array
   */
  async searchForChatbot(searchKey, limit, page, priceFrom, priceTo) {
    const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

    // Query database directly
    const results = await this._queryDatabase(searchKey, normalizedLimit, normalizedPage, priceFrom, priceTo);
    return results;
  }

  async _queryDatabase(searchKey, limit, page, priceFrom, priceTo) {
    const normalizedSearchKey = searchKey.toLowerCase().trim();
    const searchTerms = normalizedSearchKey
      .split(/\s+/)
      .map(term => term.trim())
      .filter(Boolean);

    if (!searchTerms.length) {
      return [];
    }

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
    const offset = (safePage - 1) * safeLimit;

    // Format values for SQL query
    const likePatternsArray = searchTerms.map(term => `'%${term.replace(/'/g, "''")}%'`).join(", ");
    const likePatternsSql = `ARRAY[${likePatternsArray}]`;
    const normalizedSearchKeyEscaped = normalizedSearchKey.replace(/'/g, "''");
    const priceFromFilter = priceFrom ? `AND hv.price >= ${Number(priceFrom)}` : "";
    const priceToFilter = priceTo ? `AND hv.price <= ${Number(priceTo)}` : "";

    const query = `
      WITH warehouse_data AS (
        SELECT
          hwi.variant_id,
          COALESCE(string_agg(hw.name, ' '), '') AS warehouse_names,
          COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
              'branch', hw.name,
              'quantity', hwi.qty_available
            )
          ), '[]'::json) AS inventory
        FROM haravan.warehouse_inventories hwi
        LEFT JOIN haravan.warehouses hw ON CAST(hwi.loc_id AS INTEGER) = hw.id
        WHERE (
          (hwi.qty_onhand IS NOT NULL AND hwi.qty_onhand <> 0) 
          OR (hwi.qty_committed IS NOT NULL AND hwi.qty_committed <> 0) 
          OR (hwi.qty_incoming IS NOT NULL AND hwi.qty_incoming <> 0) 
          OR (hwi.qty_available IS NOT NULL AND hwi.qty_available <> 0)
        )
        GROUP BY hwi.variant_id
      ),
      image_data AS (
        SELECT 
          hi.product_id,
          COALESCE(JSON_AGG(hi.src), '[]'::json) AS image_urls
        FROM haravan.images hi
        GROUP BY hi.product_id
      )
      SELECT
        hv.product_id,
        hv.id AS variant_id,
        hv.product_title AS name,
        hv.title AS variant_title,
        hv.handle,
        hv.sku,
        hv.barcode,
        hv.price,
        hv.published_scope,
        dsg.design_code,
        dsg.code AS design_partner_code,
        dsg.erp_code AS design_erp_code,
        COALESCE(id.image_urls, '[]'::json) AS image_urls,
        COALESCE(wd.inventory, '[]'::json) AS inventory
      FROM haravan.variants hv
        LEFT JOIN workplace.variants wv ON hv.id = wv.haravan_variant_id
        LEFT JOIN workplace.products wp ON wv.product_id = wp.id
        LEFT JOIN workplace.designs dsg ON dsg.id = wp.design_id
        LEFT JOIN warehouse_data wd ON hv.id = wd.variant_id
        LEFT JOIN image_data id ON hv.product_id = id.product_id
      WHERE
        hv.qty_available > 0
        ${priceFromFilter}
        ${priceToFilter}
        AND lower(concat_ws(
          COALESCE(hv.product_title, ''),
          COALESCE(hv.title, ''),
          COALESCE(hv.barcode, ''),
          COALESCE(hv.sku, ''),
          COALESCE(dsg.design_code, ''),
          COALESCE(dsg.code, ''),
          COALESCE(dsg.erp_code, ''),
          COALESCE(wd.warehouse_names, '')
        )) LIKE ALL(${likePatternsSql})
      ORDER BY
        CASE 
          WHEN lower(COALESCE(dsg.design_code, '')) = '${normalizedSearchKeyEscaped}' THEN 1
          WHEN lower(COALESCE(dsg.code, '')) = '${normalizedSearchKeyEscaped}' THEN 2
          WHEN lower(COALESCE(dsg.erp_code, '')) = '${normalizedSearchKeyEscaped}' THEN 3
          WHEN lower(COALESCE(hv.barcode, '')) = '${normalizedSearchKeyEscaped}' THEN 4
          WHEN lower(COALESCE(hv.sku, '')) = '${normalizedSearchKeyEscaped}' THEN 5
          WHEN lower(COALESCE(wd.warehouse_names, '')) = '${normalizedSearchKeyEscaped}' THEN 6
          ELSE 7
        END ASC,
        hv.product_title ASC
      LIMIT ${safeLimit}
      OFFSET ${offset}
    `;

    const results = await this.db.$queryRaw`${Prisma.raw(query)}`;

    return results.map(item => ({
      name: item.name,
      sku: item.sku,
      design_code: item.design_code,
      variant_title: item.variant_title,
      barcode: item.barcode,
      price: item.price ? Number(item.price) : null,
      link_haravan: `https://jemmiavn.myharavan.com/admin/products/${item.product_id}/variants/${item.variant_id}`,
      link_website: item.published_scope === "global" ? `https://jemmia.vn/products/${item.handle}` : null,
      inventory: item.inventory || [],
      image_urls: item.image_urls || []
    }));
  }
}
