import Ecommerce from "services/ecommerce";

export default class Jewelry3DMetadataController {
  static async show(ctx) {
    const { id } = ctx.req.param();
    if (isNaN(Number(id))) {
      return ctx.json({ error: "Invalid id. Must be a number." }, 400);
    }
    const productService = new Ecommerce.ProductService(ctx.env);
    const result = await productService.get3dMetadataByJewelryId(Number(id));
    if (!result) {
      return ctx.json({ error: "Jewelry not found" }, 404);
    }
    return ctx.json({ data: result }, 200);
  }
}
