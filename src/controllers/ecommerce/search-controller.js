import Ecommerce from "services/ecommerce";
import { parseNumber } from "services/utils/num-helper";
import { API_CONFIG, DEFAULT_JEWELRY_DISCOUNT } from "src/controllers/ecommerce/constant";

export default class SearchController {

  static async index(ctx) {
    const params = await ctx.req.query();
    const searchKey = params.search_key;
    const parsedLimit = Number(params.limit);
    const limit = (!Number.isFinite(parsedLimit) || parsedLimit <= 0) ? API_CONFIG.MAX_SEARCH_LIMIT : Math.min(parsedLimit, API_CONFIG.MAX_SEARCH_LIMIT);
    const page = Math.max(API_CONFIG.MIN_FROM, Number(params.page) || API_CONFIG.MIN_FROM);
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.searchJewelry(searchKey, limit, page, {
      return_inventory_metrics: params.return_inventory_metrics === "true",
      limit_selling_quantity: parseNumber(params.limit_selling_quantity, null),
      default_jewelry_discount: DEFAULT_JEWELRY_DISCOUNT
    });
    const responseBody = {
      data: result
    };
    return ctx.json(responseBody);
  }
}

