import InventoryCms from "services/inventory-cms";
export default class InventoryCheckNotificationController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const result = await InventoryCms.CheckSheetNotificationService.processInventoryCheck(data?.payload, ctx.env);
    return ctx.json(result);
  }
}
