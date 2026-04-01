import Ecommerce from "services/ecommerce";
import { API_CONFIG } from "src/controllers/ecommerce/constant";
import { validateParams } from "services/ecommerce/product/utils/validation";
import { splitParams } from "services/utils/param-helper";

export default class WeddingRingController {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      pagination: {
        from: Math.max(
          API_CONFIG.MIN_FROM,
          params.from ? Number(params.from) : API_CONFIG.DEFAULT_FROM
        ),
        limit: Math.min(
          API_CONFIG.MAX_LIMIT,
          Math.max(
            1,
            params.limit ? Number(params.limit) : API_CONFIG.DEFAULT_LIMIT
          )
        )
      },
      fineness: splitParams(params.fineness),
      material_colors: splitParams(params.material_colors),
      is_in_stock: params.is_in_stock ? params.is_in_stock === "true" : null,
      sort: {
        by: params.sort_by || "price",
        order: params.sort_order || "asc"
      },
      price: {
        min: params.min_price ? Number(params.min_price) : null,
        max: params.max_price ? Number(params.max_price) : null
      },
      product_ids: splitParams(params.product_ids)
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isInteger(n) && n > 0),
      ring_band_styles: splitParams(params.ring_band_styles),
      excluded_ring_band_styles: splitParams(params.excluded_ring_band_styles)
    };

    const { isValidated, message } = validateParams(jsonParams);
    if (!isValidated) {
      return ctx.json({ message: message }, 400);
    }
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getWeddingRings(jsonParams);
    return ctx.json(result);
  }

  static async show(ctx) {
    const { id } = ctx.req.param();
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return ctx.json({ message: "Invalid wedding ring ID" }, 400);
    }
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getWeddingRingById(productId);
    if (!result) {
      return ctx.json({ message: "Wedding ring not found" }, 404);
    }
    return ctx.json(result);
  }
}
