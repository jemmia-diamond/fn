import Ecommerce from "services/ecommerce";

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
        from: params.from ? parseInt(params.from, 10) : 1,
        limit: params.limit ? parseInt(params.limit, 10) : 24
      },
      price: {
        min: params.min_price ? parseInt(params.min_price) : null,
        max: params.max_price ? parseInt(params.max_price) : null
      },
      sort: {
        by: params.sort_by || "price",
        order: params.sort_order || "asc"
      },
      design_tags: params.design_tags ? params.design_tags.split(",") : []
    };

    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getJewelry(jsonParams);
    return ctx.json(result);
  }

  static async show(ctx) {
    const { id } = ctx.req.param();
    if (isNaN(Number(id))) {
      return ctx.json({ error: "Invalid id. Must be a number." }, 400);
    }
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getJewelryById(id);
    if (!result) {
      return ctx.json({ error: "Jewelry not found" }, 404);
    }
    return ctx.json({ data: result }, 200);
  }
}
