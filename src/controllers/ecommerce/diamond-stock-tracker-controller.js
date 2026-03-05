import DiamondService from "services/ecommerce/diamond/diamond";
import { z } from "zod";

const StockTrackerSchema = z.object({
  targets: z.array(z.object({
    s1: z.number().optional(),
    s2: z.number().optional(),
    color: z.string().optional(),
    clarity: z.string().optional(),
    carat: z.union([
      z.number(),
      z.object({
        gte: z.number().optional(),
        lte: z.number().optional(),
        gt: z.number().optional(),
        lt: z.number().optional()
      })
    ]).optional(),
    original_price: z.number().optional()
  })).min(1),
  warehouses: z.array(z.string()).optional()
});

/**
 * Controller for tracking stock and prices for dynamic diamond campaigns.
 */
export default class DiamondStockTrackerController {
  static async create(ctx) {
    let body;
    try {
      body = await ctx.req.json();
    } catch {
      return ctx.json({ message: "Request body is missing or invalid JSON. Please send a POST request with a JSON body containing 'targets'." }, 400);
    }

    const validated = StockTrackerSchema.safeParse(body);
    if (!validated.success) {
      return ctx.json({
        message: "Invalid request body structure",
        errors: validated.error.errors
      }, 400);
    }

    const { targets, warehouses } = validated.data;
    const diamondService = new DiamondService(ctx.env);
    const result = await diamondService.getDiamondStockTracker(targets, warehouses);

    return ctx.json({ data: result }, 200);
  }
}
