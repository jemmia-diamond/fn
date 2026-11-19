import Inventory from "services/inventory";

export default class SerialsController {
  /**
   * GET /api/inventory/serials?q={part of serial}&page={n}&limit={n}
   * Search serials with their exacct RFID tag (inventory scanner device API)
   */
  static async index(ctx) {
    const service = new Inventory.SerialSearchService(ctx.env);
    return ctx.json(await service.search(ctx.req.query()));
  }
}
