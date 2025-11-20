import Ecommerce from "services/ecommerce";

export default class WebsiteFormSubmissionController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const formService = new Ecommerce.FormService(ctx.env);
    const result = await formService.create(data);
    return ctx.json(result, 201);
  }
}
