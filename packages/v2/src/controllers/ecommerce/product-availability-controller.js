import Ecommerce from "services/ecommerce";

export default class ProductAvailabilityController {
  static async index(ctx) {
    const { id } = ctx.req.param();

    if (isNaN(Number(id))) {
      return ctx.json({ error: "Invalid id. Must be a number." }, 400);
    }

    const warehouseService = new Ecommerce.WarehouseService(ctx.env);
    const results = await warehouseService.getAvailableWarehouses(id);

    return ctx.json({ data: results }, 200);
  }
}
