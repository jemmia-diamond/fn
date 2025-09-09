import Ecommerce from "services/ecommerce";
import { API_CONFIG } from "src/controllers/ecommerce/constant";
import { validateParams } from "services/ecommerce/product/utils/validation";

export default class WeddingRingController {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      pagination: {
        from: Math.max(API_CONFIG.MIN_FROM, params.from ? Number(params.from) : API_CONFIG.DEFAULT_FROM),
        limit: Math.min(API_CONFIG.MAX_LIMIT, Math.max(1, params.limit ? Number(params.limit) : API_CONFIG.DEFAULT_LIMIT))
      },
      fineness: params.fineness ? params.fineness.split(",") : [],
      material_colors: params.material_colors ? params.material_colors.split(",") : [],
      sort: {
        by: params.sort_by || "price",
        order: params.sort_order || "asc"
      },
      price: {
        min: params.min_price ? Number(params.min_price) : null,
        max: params.max_price ? Number(params.max_price) : null
      },
      product_ids: params.product_ids
        ? params.product_ids
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => Number.isInteger(n) && n > 0)
        : []
    };

    const {isValidated, message} = validateParams(jsonParams);
    if (!isValidated) {
      return ctx.json({ message: message }, 400);
    }
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getWeddingRings(jsonParams);
    return ctx.json(result);
  }
}
