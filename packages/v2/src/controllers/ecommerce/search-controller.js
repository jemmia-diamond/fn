import Ecommerce from "services/ecommerce";
const MAX_SEARCH_RESULT = 30;

export default class SearchController {
  static async index(ctx) {
    const params = await ctx.req.query();
    const searchKey = params.search_key;
    const limit =
      Number(params.limit) <= MAX_SEARCH_RESULT
        ? Number(params.limit)
        : MAX_SEARCH_RESULT;
    const page = Math.max(1, Number(params.page) || 1);
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.searchJewelry(searchKey, limit, page);
    const responseBody = {
      data: result
    };
    return ctx.json(responseBody);
  }
}
