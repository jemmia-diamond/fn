import InventoryCheckSheetController from "controllers/webhook/inventory-cms/inventory-check-sheet";

export default class InventoryCmsWebhook {
  static async register(webhook) {
    const inventoryCmsWebhookNamespace = webhook.basePath("/inventory_cms");
    inventoryCmsWebhookNamespace.post(
      "/inventory_check_sheets",
      InventoryCheckSheetController.create,
    );
  }
}
