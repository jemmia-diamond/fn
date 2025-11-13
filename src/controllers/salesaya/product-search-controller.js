import Salesaya from "services/salesaya";
import { HTTPException } from "hono/http-exception";

const MAX_SEARCH_RESULT = 50;

export default class ProductSearchController {
  /**
   * GET /api/salesaya/products/search
   * Search products (keyword/code) for Salesaya chatbot
   *
   * Query params:
   * - q (or search_key): Search keyword (keyword or product code)
   * - limit: Number of results (default: 10, max: 50)
   * - page: Page number (default: 1)
   *
   * Response: name, sku, variant_title, barcode, price, link_haravan, inventory, image_urls
   */
  static async index(ctx) {
    const params = await ctx.req.query();
    const searchKey = params.q || params.search_key;
    const limitParam = params.limit ? Number(params.limit) : 10;
    const limit = Math.min(
      Number.isFinite(limitParam) ? Math.floor(limitParam) : 10,
      MAX_SEARCH_RESULT
    );
    const pageParam = params.page ? Number(params.page) : 1;
    const page = Number.isFinite(pageParam) ? Math.floor(pageParam) : 1;

    if (!searchKey || searchKey.trim().length === 0) {
      throw new HTTPException(400, {
        message: "Query parameter 'q' or 'search_key' is required"
      });
    }

    if (limit < 1) {
      throw new HTTPException(400, {
        message: "limit must be greater than 0"
      });
    }

    if (page < 1) {
      throw new HTTPException(400, {
        message: "page must be greater than 0"
      });
    }

    const productSearchService = new Salesaya.ProductSearchService(ctx.env);
    const result = await productSearchService.searchForChatbot(
      searchKey.trim(),
      limit,
      page,
      ctx
    );

    return ctx.json({
      success: true,
      data: result,
      count: result.length,
      page,
      limit
    });
  }
}
