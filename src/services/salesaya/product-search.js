import Database from "services/database";
import * as Sentry from "@sentry/cloudflare";

export default class ProductSearchService {
  static CACHE_TTL = 300; // 5 minutes

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env, "neon");
    this.kv = env.FN_KV;
  }

  /**
   * Search products for Salesaya chatbot with cache strategy
   *
   * Cache strategy:
   * 1. Cloudflare Cache API (edge cache) - fastest
   * 2. KV storage fallback - if cache API miss
   * 3. Database query - if both miss
   *
   * @param {string} searchKey - Search keyword (keyword or code)
   * @param {number} limit - Number of results per page
   * @param {number} page - Page number (1-based)
   * @param {object} ctx - Hono context (to access cache API)
   * @returns {Promise<Array>} Product list with format:
   *   - name: Product name
   *   - price: Price
   *   - inventory: Inventory by branch [{ branch: "HCM", quantity: 10 }, ...]
   *   - real_image: Real image (URL)
   *   - web_image: Web image (URL)
   */
  async searchForChatbot(searchKey, limit, page, ctx) {
    const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const cacheKey = this._generateCacheKey(searchKey, normalizedLimit, normalizedPage);

    try {
      // 1. Try Cloudflare Cache API first (fastest, < 10ms)
      const cached = await this._getFromCacheAPI(ctx, cacheKey);
      if (cached) {
        return cached;
      }

      // 2. Try KV storage (fallback, ~50-100ms)
      const kvCached = await this._getFromKV(cacheKey);
      if (kvCached) {
        // Re-populate Cache API for next request
        await this._setCacheAPI(ctx, cacheKey, kvCached);
        return kvCached;
      }

      // 3. Query database
      const results = await this._queryDatabase(searchKey, normalizedLimit, normalizedPage);

      // 4. Cache results
      await Promise.all([
        this._setCacheAPI(ctx, cacheKey, results),
        this._setKV(cacheKey, results)
      ]);

      return results;
    } catch (error) {
      Sentry.captureException(error);
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  _generateCacheKey(searchKey, limit, page) {
    const normalized = searchKey.toLowerCase().trim();
    return `salesaya:product:search:${normalized}:${limit}:${page}`;
  }

  async _getFromCacheAPI(ctx, cacheKey) {
    try {
      if (typeof caches === "undefined" || !caches.default) {
        return null;
      }
      const cache = caches.default;
      const cacheUrl = new Request(`https://cache.local/${cacheKey}`);
      const cachedResponse = await cache.match(cacheUrl);

      if (cachedResponse) {
        return await cachedResponse.json();
      }
      return null;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async _setCacheAPI(ctx, cacheKey, data) {
    try {
      if (typeof caches === "undefined" || !caches.default) {
        return;
      }
      const cache = caches.default;
      const cacheUrl = new Request(`https://cache.local/${cacheKey}`);
      const response = new Response(JSON.stringify(data), {
        headers: {
          "Cache-Control": `public, max-age=${ProductSearchService.CACHE_TTL}`,
          "Content-Type": "application/json"
        }
      });

      cache.put(cacheUrl, response.clone()).catch(() => {
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async _getFromKV(cacheKey) {
    try {
      if (!this.kv) return null;

      const cached = await this.kv.get(cacheKey, { type: "json" });
      return cached;
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  async _setKV(cacheKey, data) {
    try {
      if (!this.kv) return;

      await this.kv.put(
        cacheKey,
        JSON.stringify(data),
        { expirationTtl: ProductSearchService.CACHE_TTL }
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async _queryDatabase(searchKey, limit, page) {
    const lowerSearchKey = searchKey.toLowerCase();
    const likePattern = `%${lowerSearchKey}%`;
    const searchTerms = lowerSearchKey
      .split(/\s+/)
      .map(term => term.trim())
      .filter(Boolean);
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const fetchLimit = Math.max(limit * safePage, limit);

    const results = await this.db.$queryRaw`
      SELECT
        hv.product_id,
        hv.id AS variant_id,
        hv.product_title AS name,
        hv.title AS variant_title,
        hv.sku,
        hv.barcode,
        hv.price,
        wd.design_code,
        wd.code AS design_partner_code,
        wd.erp_code AS design_erp_code,
        -- Image URLs
        (
          SELECT COALESCE(JSON_AGG(hi.src), '[]'::json)
          FROM haravan.images hi
          WHERE hi.product_id = hv.product_id
        ) AS image_urls,
        -- Inventory by branch
        (
          SELECT COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
              'branch', hw.name,
              'quantity', hwi.qty_available
            )
          ), '[]'::json)
          FROM haravan.warehouse_inventories hwi
          LEFT JOIN haravan.warehouses hw ON CAST(hwi.loc_id AS INTEGER) = hw.id
          WHERE hwi.variant_id = hv.id
            AND (
              (hwi.qty_onhand IS NOT NULL AND hwi.qty_onhand <> 0) 
              OR (hwi.qty_committed IS NOT NULL AND hwi.qty_committed <> 0) 
              OR (hwi.qty_incoming IS NOT NULL AND hwi.qty_incoming <> 0) 
              OR (hwi.qty_available IS NOT NULL AND hwi.qty_available <> 0)
            )
        ) AS inventory
      FROM haravan.variants hv
        LEFT JOIN workplace.variants wv ON hv.id = wv.haravan_variant_id
        LEFT JOIN workplace.products wp ON wv.product_id = wp.id
        LEFT JOIN workplace.designs wd ON wd.id = wp.design_id
      WHERE 
        -- Only variants with inventory
        hv.qty_available > 0
        -- Multi-column search
        AND lower(concat(
          COALESCE(hv.product_title, ''),
          ' ',
          COALESCE(hv.title, ''),
          ' ',
          COALESCE(hv.barcode, ''),
          ' ',
          COALESCE(hv.sku, ''),
          ' ',
          COALESCE(wd.design_code, ''),
          ' ',
          COALESCE(wd.code, ''),
          ' ',
          COALESCE(wd.erp_code, '')
        )) LIKE ${likePattern}
      ORDER BY 
        -- Priority: exact match code > name match
        CASE 
          WHEN lower(COALESCE(wd.design_code, '')) = ${lowerSearchKey} THEN 1
          WHEN lower(COALESCE(wd.code, '')) = ${lowerSearchKey} THEN 2
          WHEN lower(COALESCE(wd.erp_code, '')) = ${lowerSearchKey} THEN 3
          WHEN lower(COALESCE(hv.barcode, '')) = ${lowerSearchKey} THEN 4
          WHEN lower(COALESCE(hv.sku, '')) = ${lowerSearchKey} THEN 5
          WHEN lower(COALESCE(hv.product_title, '')) LIKE ${likePattern} THEN 6
          ELSE 7
        END ASC,
        hv.product_title ASC
      LIMIT ${fetchLimit}
    `;

    const filteredResults = searchTerms.length
      ? results.filter(item => {
        const combinedFields = [
          item.name,
          item.variant_title,
          item.barcode,
          item.sku,
          item.design_code,
          item.design_partner_code,
          item.design_erp_code
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchTerms.every(term => combinedFields.includes(term));
      })
      : results;

    const startIndex = (safePage - 1) * limit;
    const endIndex = startIndex + limit;
    const pagedResults = filteredResults.slice(startIndex, endIndex);

    return pagedResults.map(item => ({
      name: item.name,
      sku: item.sku,
      variant_title: item.variant_title,
      barcode: item.barcode,
      price: item.price ? Number(item.price) : null,
      link_haravan: `https://jemmiavn.myharavan.com/admin/products/${item.product_id}/variants/${item.variant_id}`,
      inventory: item.inventory || [],
      image_urls: item.image_urls || []
    }));
  }
}
