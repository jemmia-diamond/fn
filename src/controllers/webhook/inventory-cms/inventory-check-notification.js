import InventoryNotificationService from "services/inventory-cms/inventory-check-sheet/notification.js";

export default class InventoryCheckNotificationController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const result = await InventoryNotificationService.processInventoryCheck(data?.payload || data, ctx.env);
    return ctx.json(result);
  }
}
