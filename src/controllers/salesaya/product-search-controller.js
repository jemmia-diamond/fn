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
   *
   * Response: name, price, inventory (by branch), real image, web image
   */
  static async index(ctx) {
    const params = await ctx.req.query();
    const searchKey = params.q || params.search_key;
    const limit = Math.min(Number(params.limit) || 10, MAX_SEARCH_RESULT);

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

    const productSearchService = new Salesaya.ProductSearchService(ctx.env);
    const result = await productSearchService.searchForChatbot(
      searchKey.trim(),
      limit,
      ctx
    );

    return ctx.json({
      success: true,
      data: result,
      count: result.length
    });
  }
}
