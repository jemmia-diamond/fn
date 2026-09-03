import ProductCreatorService from "services/sync/nocodb-to-haravan/products/product-creator-service";

export default class ProductsController {
  static async handle(ctx) {
    const payload = await ctx.req.json();

    if (!payload?.type || !payload?.data || payload.type !== "records.after.update") {
      return ctx.json({ message: "Invalid or ignored payload" }, 200);
    }

    const row = payload.data.rows?.[0];

    if (!row?.auto_create_haravan) {
      return ctx.json({ message: "Ignored" }, 200);
    }

    const service = new ProductCreatorService(ctx.env);
    await service.handle(payload);
    return ctx.json({ message: "Product created on Haravan and NocoDB updated" });
  }
}
