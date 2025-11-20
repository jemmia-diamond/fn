import DiamondService from "services/ecommerce/diamond/diamond";

export default class DiamondPricesController {

  static async index(ctx) {
    const diamondService = new DiamondService(ctx.env);
    const data = await diamondService.getDiamondPriceListMatrix();
    return ctx.json(data, 200);
  }
}
