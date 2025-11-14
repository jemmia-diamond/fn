import Salesaya from "services/salesaya";

const MAX_SEARCH_RESULT = 50;

export default class ProductSearchController {
  /**
   * GET /api/salesaya/product-searches
   * Search products for Salesaya chatbot
   *
   * Query params:
   * - q: Search keyword (keyword or product code)
   * - limit: Number of results (default: 10, max: 50)
   * - page: Page number (default: 1)
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
      return ctx.json({
        success: false,
        error: "Query parameter 'q' or 'search_key' is required"
      }, 400);
    }

    if (limit < 1) {
      return ctx.json({
        success: false,
        error: "limit must be greater than 0"
      }, 400);
    }

    if (page < 1) {
      return ctx.json({
        success: false,
        error: "page must be greater than 0"
      }, 400);
    }

    const productSearchService = new Salesaya.ProductSearchService(ctx.env);
    const result = await productSearchService.searchForChatbot(
      searchKey.trim(),
      limit,
      page
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
