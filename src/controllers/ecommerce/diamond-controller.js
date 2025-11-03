import DiamondService from "services/ecommerce/diamond/diamond";

export default class DiamondController {

  static async show(ctx) {
    const params = await ctx.req.query();
    const jsonParams = {
      shapes: params.shapes ? params.shapes.split(",") : undefined,
      colors: params.colors ? params.colors.split(",") : undefined,
      clarities: params.clarities ? params.clarities.split(",") : undefined,
      price: {
        min: params["price.min"] ? parseFloat(params["price.min"]) : undefined,
        max: params["price.max"] ? parseFloat(params["price.max"]) : undefined
      },
      sort: {
        by: params["sort.by"],
        order: params["sort.order"]
      },
      pagination: {
        limit: params.limit ? parseInt(params.limit, 10) : 20,
        from: params.from ? parseInt(params.from, 10) : 1
      }
    };

    const diamondService = new DiamondService(ctx.env);
    const result = await diamondService.getDiamonds(jsonParams);
    return ctx.json(result, 200);
  }

  static async index(ctx) {
    const productId = parseInt(ctx.req.param("id"), 10);
    if (!productId || isNaN(productId)) {
      return ctx.json({ message: "Invalid or missing diamond 'id' parameter" }, 400);
    }

    const diamondService = new DiamondService(ctx.env);
    const result = await diamondService.getDiamondByProductId(productId);

    if (!result) {
      return ctx.json({ message: "Diamond not found" }, 404);
    }

    return ctx.json({ data: result }, 200);
  }
}
