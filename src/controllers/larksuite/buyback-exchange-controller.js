import Larksuite from "services/larksuite";

export default class BuybackExchangeController {
  static async index(ctx) {
    const params = await ctx.req.query();
    if (!params.phone_number) {
      return ctx.json({ sucess: false, message: "Phone number is required" }, 400);
    }

    const service = new Larksuite.BuybackExchangeService(ctx.env);
    const result = await service.find(params);

    if (!result || result.length === 0) {
      return ctx.json({ sucess: false, message: "Data not found" }, 404);
    }

    return ctx.json({ sucess: true, data: result }, 200);
  }
}
