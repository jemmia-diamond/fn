import Inventory from "services/inventory";

export default class AvailabilityController {
  /**
   * GET /api/inventory/availability?loc_id={loc_id}
   * Fetch inventory availability for a location (inventory scanner device API)
   */
  static async index(ctx) {
    const locIdParam = ctx.req.query("loc_id");
    const locId = Number(locIdParam);

    if (!locIdParam || !Number.isInteger(locId)) {
      return ctx.json({ success: false, error: "Location ID is missing or invalid" }, 400);
    }

    const availabilityService = new Inventory.AvailabilityService(ctx.env);
    const rows = await availabilityService.fetchInventory(locId);

    return ctx.json(availabilityService.serialize(rows));
  }
}
