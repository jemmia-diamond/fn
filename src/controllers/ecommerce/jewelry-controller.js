import Ecommerce from "services/ecommerce";
import { parseNumber } from "services/utils/num-helper";

export default class JewelryController {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      categories: params.categories ? params.categories.split(",") : [],
      product_types: params.product_types ? params.product_types.split(",") : [],
      material_colors: params.material_colors ? params.material_colors.split(",") : [],
      genders: params.gender ? params.gender.split(",") : [],
      fineness: params.fineness ? params.fineness.split(",") : [],
      pages: params.pages ? params.pages.split(",") : [],
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
        lower: params["main_holder_size.lower"] ? parseFloat(params["main_holder_size.lower"]) : undefined,
        upper: params["main_holder_size.upper"] ? parseFloat(params["main_holder_size.upper"]) : undefined
      },
      design_tags: params.design_tags ? params.design_tags.split(",") : [],
      ring_head_styles: params.ring_head_styles ? params.ring_head_styles.split(",") : [],
      ring_band_styles: params.ring_band_styles ? params.ring_band_styles.split(",") : [],
      excluded_ring_head_styles: params.excluded_ring_head_styles ? params.excluded_ring_head_styles.split(",") : [],
      excluded_ring_band_styles: params.excluded_ring_band_styles ? params.excluded_ring_band_styles.split(",") : [],
      product_ids: params.product_ids
        ? params.product_ids
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => Number.isInteger(n) && n > 0)
        : [],
      linked_collections: params.linked_collections ? params.linked_collections.split(",") : [],
      matched_diamonds: params.matched_diamonds === "true",
      ring_sizes: params.ring_sizes ? params.ring_sizes.split(",").map((size) => size.trim()) : [],
      warehouse_ids: params.warehouse_ids ? params.warehouse_ids.split(",").map((id) => id.trim()) : []
    };

    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getJewelry(jsonParams);
    return ctx.json(result);
  }

  static async show(ctx) {
    const { id } = ctx.req.param();
    const { matched_diamonds } = ctx.req.query();
    if (isNaN(Number(id))) {
      return ctx.json({ error: "Invalid id. Must be a number." }, 400);
    }
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getJewelryById(id, {
      matchedDiamonds: matched_diamonds === "true"
    });
    if (!result) {
      return ctx.json({ error: "Jewelry not found" }, 404);
    }
    return ctx.json({ data: result }, 200);
  }
}
