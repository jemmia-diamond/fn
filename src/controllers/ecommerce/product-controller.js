import Ecommerce from "services/ecommerce";

export default class ProductController {
  static async index(ctx) {
    const params = await ctx.req.query();

    const jsonParams = {
      categories: params.categories ? params.categories.split(',') : [],
      product_types: params.product_types ? params.product_types.split(',') : [],
      material_colors: params.material_colors ? params.material_colors.split(',') : [],
      genders: params.gender ? params.gender.split(',') : [],
      pagination: {
        from: params.from ? parseInt(params.from, 10) : 1,
        limit: params.limit ? parseInt(params.limit, 10) : 24
      },
      sort: {
        by: params.sort_by || 'price',
        order: params.sort_order || 'asc'
      }
    };

    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.getJewelry(jsonParams);
    return ctx.json(result);
  }
}

