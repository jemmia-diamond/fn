import CollectionSyncService from "services/sync/nocodb-to-haravan/collections/collection-sync-service";

export default class HaravanCollectionsController {
  static async handle(ctx) {
    const payload = await ctx.req.json();
    const service = new CollectionSyncService(ctx.env);
    await service.handle(payload);
    return ctx.json({ message: "Custom collection synced on Haravan and NocoDB updated" });
  }
}
