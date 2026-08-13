import TemporaryProductService from "services/workplace/temporary-product-service";

export default class TemporaryProductController {
  static async create(ctx) {
    const event = await ctx.req.json();
    const tempProductService = new TemporaryProductService(ctx.env);
    const result = await tempProductService.processTemporaryProduct(event);
    // Match legacy Lambda response envelope — Lark automation reads body.data.sku / body.data.serial_number
    return ctx.json({ data: result }, 200);
  }
}
