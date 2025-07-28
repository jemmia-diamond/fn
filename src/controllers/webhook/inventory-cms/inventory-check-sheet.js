export default class InventoryCheckSheetController {
  static async create(_ctx) {
    return _ctx.json({ message: "Inventory check sheet received" });
  }
}
