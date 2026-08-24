import MoissaniteProductCreatorService from "services/sync/nocodb-to-haravan/moissanite/moissanite-product-creator-service";

export default class MoissaniteController {
  static async create(ctx) {
    const payload = await ctx.req.json();

    if (!payload?.type || !payload?.data || payload.type !== "records.after.update") {
      return ctx.json({ message: "Invalid or ignored payload" }, 200);
    }

    const row = payload.data.rows?.[0];

    if (!row?.auto_create) {
      return ctx.json({ message: "Ignored" }, 200);
    }

    const service = new MoissaniteProductCreatorService(ctx.env);
    await service.handle(payload);
    return ctx.json({ message: "Moissanite product created on Haravan and NocoDB updated" });
  }
}
