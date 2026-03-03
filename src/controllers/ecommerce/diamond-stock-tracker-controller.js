import DiamondService from "services/ecommerce/diamond/diamond";
import { z } from "zod";

const StockTrackerSchema = z.object({
  targets: z.array(z.object({
    s1: z.number(),
    s2: z.number(),
    color: z.string(),
    clarity: z.string(),
    original_price: z.number()
  })).min(1),
  warehouses: z.array(z.string()).optional()
});

/**
 * Controller for tracking stock and prices for dynamic diamond campaigns.
 */
export default class DiamondStockTrackerController {
  static async create(ctx) {
    try {
      const body = await ctx.req.json();
      const validated = StockTrackerSchema.safeParse(body);

      if (!validated.success) {
        return ctx.json({
          message: "Invalid request body",
          errors: validated.error.errors
        }, 400);
      }

      const { targets, warehouses } = validated.data;
      const diamondService = new DiamondService(ctx.env);
      const result = await diamondService.getDiamondStockTracker(targets, warehouses);

      return ctx.json({ data: result }, 200);
    } catch (e) {
      return ctx.json({ message: e.message || "Internal Server Error" }, 500);
    }
  }
}
