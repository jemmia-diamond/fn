import GoogleMerchantProductSyncService from "services/google/sync-products.js";

export default class MerchantController {
  static async create(ctx) {
    try {
      const service = new GoogleMerchantProductSyncService(ctx.env);
      const result = await service.sync();
      if (result.success) {
        return ctx.json({ message: "Sync completed successfully", count: result.syncedCount });
      } else {
        return ctx.json({ error: "Sync failed", details: result.errors }, 500);
      }
    } catch (error) {
      console.warn("Controller error:", error);
      return ctx.json({ error: "Internal Server Error" }, 500);
    }
  }
}
