
import Ecommerce from "services/ecommerce";

export default class ProductController {
  static async show(ctx) {
    const { id } = ctx.req.param();
    const productService = new Ecommerce.ProductService(ctx.env);

    try {
      const product = await productService.getProductById(id);
      return ctx.json({ product }, 200);
    } catch (error) {
      return ctx.json(
        { error: error.message || "Internal Server Error" },
        error.status || 500
      );    
    }
  }
}
