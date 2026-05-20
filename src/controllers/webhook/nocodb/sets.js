import SetsSyncService from "services/sync/nocodb-to-haravan/sets/sets-sync-service";

export default class SetsController {
  static async handle(ctx) {
    const payload = await ctx.req.json();
    const env = ctx.env;

    if (!payload || !payload.type || !payload.data || payload.data.table_name !== "sets") {
      return ctx.json({ message: "Invalid or ignored payload" }, { status: 200 });
    }

    const setsSyncService = new SetsSyncService(env);
    await setsSyncService.sync(payload);

    return ctx.json({ message: "Processed sets webhook successfully" });
  }
}
