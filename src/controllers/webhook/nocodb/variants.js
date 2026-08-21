import VariantCreatorService from "services/sync/nocodb-to-haravan/variants/variant-creator-service";

export default class VariantsController {
  static async handle(ctx) {
    const payload = await ctx.req.json();
    const service = new VariantCreatorService(ctx.env);
    await service.handle(payload);
    return ctx.json({ message: "Variant created on Haravan and NocoDB updated" });
  }
}
