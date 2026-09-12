import DiamondAutoCreateService from "services/sync/nocodb-to-haravan/diamonds/diamond-auto-create-service";

export default class DiamondsController {
  static async handle(ctx) {
    const payload = await ctx.req.json();

    if (
      !payload?.type ||
      !payload?.data ||
      payload.type !== "records.after.update"
    ) {
      return ctx.json({ message: "Invalid or ignored payload" }, 200);
    }

    const row = payload.data.rows?.[0];
    const tableId = payload.data.table_id;

    if (!row?.auto_create_haravan_product) {
      return ctx.json({ message: "Ignored" }, 200);
    }

    const service = new DiamondAutoCreateService(ctx.env);
    await service.create(row, tableId);

    return ctx.json({ message: "Diamond product created on Haravan" });
  }
}
