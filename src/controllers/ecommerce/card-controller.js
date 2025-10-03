import { HTTPException } from "hono/http-exception";
import Ecommerce from "services/ecommerce";

export default class CardController {
  static async create(ctx) {
    const data = await ctx.req.json();
    try {
      const cardService = new Ecommerce.CardService(ctx.env);
      const result = await cardService.create(data);
      return ctx.json(result, 201);
    } catch (error) {
      console.error("Error creating data:", error);
      throw new HTTPException(500, { message: "Failed to create data", error: error.message });
    }
  }

  static async show(ctx) {
    const { id } = ctx.req.param();
    const cardService = new Ecommerce.CardService(ctx.env);
    try {
      const result = await cardService.readById(id);
      if (!result) {
        throw new HTTPException(404, { message: "Data not found" });
      }
      return ctx.json(result, 200);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      console.error("Error fetching data:", error);
      throw new HTTPException(500, { message: "Failed to fetch data", error: error.message });
    }
  }
}
