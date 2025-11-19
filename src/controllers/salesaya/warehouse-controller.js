import Salesaya from "services/salesaya";

export default class WarehouseController {
  /**
     * GET /api/salesaya/warehouses
     * Fetch list of warehouses from Salesaya service
     */
  static async index(ctx) {
    try {
      const warehouseService = new Salesaya.WarehouseService(ctx.env);
      const warehouses = await warehouseService.fetchWarehouses();
      return ctx.json({
        success: true,
        data: warehouses
      });
    } catch (error) {
      return ctx.json({
        success: false,
        error: error.message || "Failed to fetch warehouses"
      }, 500);
    }
  }
}
