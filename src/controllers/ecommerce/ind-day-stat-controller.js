import Ecommerce from "services/ecommerce";

export default class IndDayStatController {
  static async show(ctx) {
    try {
      const indDayStatService = new Ecommerce.IndDayStatService(ctx.env);
      const result = await indDayStatService.getStats();
      return ctx.json({ result }, 200);
    } catch (error) {
      return ctx.json({ error: error.message }, 500);
    }
  }

  static async destroy(ctx) {
    try {
      const indDayStatService = new Ecommerce.IndDayStatService(ctx.env);
      await indDayStatService.reset();
      return ctx.json({ success: true }, 200);
    } catch (error) {
      return ctx.json({ error: error.message }, 500);
    }
  }
}
