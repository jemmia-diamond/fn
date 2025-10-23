import InventoryCms from "services/inventory-cms";

export default class InventoryCheckSheetController {
  static async create(ctx) {
    const inventoryCheckSheetService = new InventoryCms.InventoryCheckSheetService(ctx.env);
    const data = await ctx.req.json();
    await inventoryCheckSheetService.processInventoryCheckSheetToDatabase(data);
    return ctx.json({ message: "Inventory check sheet received" });
  }
}
