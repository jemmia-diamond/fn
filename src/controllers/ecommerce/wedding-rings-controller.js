import Ecommerce from "services/ecommerce";

export default class WeddingRingController {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      pagination: {
        from: params.from ? parseInt(params.from, 10) : 1,
        limit: params.limit ? parseInt(params.limit, 10) : 24
      }    
    };

    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getWeddingRings(jsonParams);
    return ctx.json(result);
  }
}
