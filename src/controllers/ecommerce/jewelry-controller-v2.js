import Ecommerce from "services/ecommerce";
import { parseNumber } from "services/utils/num-helper";
import { splitParams } from "services/utils/param-helper";

export default class JewelryControllerV2 {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      categories: splitParams(params.categories),
      product_types: splitParams(params.product_types),
      material_colors: splitParams(params.material_colors),
      genders: splitParams(params.gender),
      fineness: splitParams(params.fineness),
      pages: splitParams(params.pages),
      is_in_stock: params.is_in_stock ? params.is_in_stock === "true" : null,
      pagination: {
        from: parseNumber(params.from, 1),
        limit: parseNumber(params.limit, 24)
      },
      price: {
        min: parseNumber(params.min_price, null),
        max: parseNumber(params.max_price, null)
      },
      sort: {
        by: params.sort_by || "price",
        order: params.sort_order || "asc"
      },
      main_holder_size: {
        lower: parseNumber(params["main_holder_size.lower"], undefined, true),
        upper: parseNumber(params["main_holder_size.upper"], undefined, true)
      },
      design_tags: splitParams(params.design_tags),
      ring_head_styles: splitParams(params.ring_head_styles),
      ring_band_styles: splitParams(params.ring_band_styles),
      excluded_ring_head_styles: splitParams(params.excluded_ring_head_styles),
      return_inventory_metrics: params.return_inventory_metrics === "true",
      limit_selling_quantity: parseNumber(params.limit_selling_quantity, null),
      excluded_ring_band_styles: splitParams(params.excluded_ring_band_styles),
      product_ids: splitParams(params.product_ids)
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isInteger(n) && n > 0),
      linked_collections: splitParams(params.linked_collections),
      matched_diamonds: params.matched_diamonds === "true",
      ring_sizes: splitParams(params.ring_sizes),
      warehouse_ids: splitParams(params.warehouse_ids)
    };

    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getJewelryV2(jsonParams);
    return ctx.json(result);
  }

  static async show(ctx) {
    const { id } = ctx.req.param();
    const params = await ctx.req.query();
    if (isNaN(Number(id))) {
      return ctx.json({ error: "Invalid id. Must be a number." }, 400);
    }
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getJewelryByIdV2(id, {
      matched_diamonds: params.matched_diamonds === "true",
      return_inventory_metrics: params.return_inventory_metrics === "true",
      limit_selling_quantity: parseNumber(params.limit_selling_quantity, null)
    });
    if (!result) {
      return ctx.json({ error: "Jewelry not found" }, 404);
    }
    return ctx.json({ data: result }, 200);
  }
}
