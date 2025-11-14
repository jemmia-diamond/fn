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
   * - priceFrom: Minimum price filter (optional)
   * - priceTo: Maximum price filter (optional)
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

    // Handle price filters
    const priceFromParam = params.priceFrom || params.price_from;
    const priceToParam = params.priceTo || params.price_to;
    const priceFrom = priceFromParam ? Number(priceFromParam) : null;
    const priceTo = priceToParam ? Number(priceToParam) : null;

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

    if (priceFrom !== null && (isNaN(priceFrom) || priceFrom < 0)) {
      return ctx.json({
        success: false,
        error: "priceFrom must be a valid positive number"
      }, 400);
    }

    if (priceTo !== null && (isNaN(priceTo) || priceTo < 0)) {
      return ctx.json({
        success: false,
        error: "priceTo must be a valid positive number"
      }, 400);
    }

    if (priceFrom !== null && priceTo !== null && priceFrom > priceTo) {
      return ctx.json({
        success: false,
        error: "priceFrom must be less than or equal to priceTo"
      }, 400);
    }

    const productSearchService = new Salesaya.ProductSearchService(ctx.env);
    const result = await productSearchService.searchForChatbot(
      searchKey.trim(),
      limit,
      page,
      priceFrom,
      priceTo
    );

    return ctx.json({
      success: true,
      data: result,
      count: result.length,
      page,
      limit,
      priceFrom,
      priceTo
    });
  }
}
