import MoissaniteProductCreatorService from "services/sync/nocodb-to-haravan/moissanite/moissanite-product-creator-service";

export default class MoissaniteController {
  static async handle(ctx) {
    const payload = await ctx.req.json();
    const service = new MoissaniteProductCreatorService(ctx.env);
    await service.handle(payload);
    return ctx.json({ message: "Moissanite product created on Haravan and NocoDB updated" });
  }
}
