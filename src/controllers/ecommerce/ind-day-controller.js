import Ecommerce from "services/ecommerce";

export default class IndDayController {
  static async show(ctx) {
    try {
      const indDayService = new Ecommerce.IndDayService(ctx.env);
      const result = await indDayService.getStats();
      return ctx.json({ result }, 200);
    } catch (error) {
      return ctx.json({ error: error.message }, 500);
    }
  }

  static async destroy(ctx) {
    try {
      const indDayService = new Ecommerce.IndDayService(ctx.env);
      await indDayService.reset();
      return ctx.json({ success: true }, 200);
    } catch (error) {
      return ctx.json({ error: error.message }, 500);
    }
  }
}
