import Ecommerce from "services/ecommerce";
const DEFAULT_LIMIT = 24;
const DEFAULT_FROM = 1;

export default class WeddingRingController {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      pagination: {
        from: params.from ? Number(params.from) : DEFAULT_FROM,
        limit: params.limit ? Number(params.limit) : DEFAULT_LIMIT
      }    
    };

    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getWeddingRings(jsonParams);
    return ctx.json(result);
  }
}
