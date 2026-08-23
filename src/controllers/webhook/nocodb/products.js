import ProductCreatorService from "services/sync/nocodb-to-haravan/products/product-creator-service";

export default class ProductsController {
  static async handle(ctx) {
    const payload = await ctx.req.json();
    const service = new ProductCreatorService(ctx.env);
    await service.handle(payload);
    return ctx.json({
      message: "Product created on Haravan and NocoDB updated"
    });
  }
}
