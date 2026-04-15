import InventoryCms from "services/inventory-cms";
import * as Sentry from "@sentry/cloudflare";

export default class InventoryCheckNotificationController {
  static async create(ctx) {
    const data = await ctx.req.json();
    try {
      const result = await InventoryCms.CheckSheetNotificationService.processInventoryCheck(data?.payload, ctx.env);
      return ctx.json(result);
    } catch (error) {
      console.warn(error);
      Sentry.captureException(error);
      return ctx.json({ message: error.message, status: 500 }, 500);
    }
  }
}
