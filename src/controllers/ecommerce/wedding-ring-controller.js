import Ecommerce from "services/ecommerce";
const DEFAULT_LIMIT = 24;
const DEFAULT_FROM = 1;
const MIN_FROM = 1;
const MAX_LIMIT = 100;

export default class WeddingRingController {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      pagination: {
        from: Math.max(MIN_FROM, params.from ? Number(params.from) : DEFAULT_FROM),
        limit: Math.min(MAX_LIMIT, Math.max(1, params.limit ? Number(params.limit) : DEFAULT_LIMIT))
      }    
    };

    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getWeddingRings(jsonParams);
    return ctx.json(result);
  }
}
