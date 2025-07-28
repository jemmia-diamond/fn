export default class InventoryCheckSheetController {
  static async create(ctx) {
    return ctx.json({ message: "Inventory check sheet received" });
  }
}
