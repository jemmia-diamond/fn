import InventoryCheckSheetController from "controllers/webhook/inventory-cms/inventory-check-sheet";
import InventoryCheckNotificationController from "controllers/webhook/inventory-cms/inventory-check-notification";

export default class InventoryCmsWebhook {
  static async register(webhook) {
    const inventoryCmsWebhookNamespace = webhook.basePath("/inventory_cms");
    inventoryCmsWebhookNamespace.post("/inventory_check_sheets", InventoryCheckSheetController.create);
    inventoryCmsWebhookNamespace.post("/inventory_check", InventoryCheckNotificationController.create);
  }
}
