import Ecommerce from "services/ecommerce";
import { HTTPException } from "hono/http-exception";

export default class OrderController {
  static async show(ctx) {
    const { id } = ctx.req.param();

    const orderService = new Ecommerce.OrderService(ctx.env);
    try {
      const orderDetails = await orderService.trackOrder(id);
      if (!orderDetails) {
        throw new HTTPException(404, { message: "Order not found" });
      }
      return ctx.json(orderDetails);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error tracking order:", error);
      throw new HTTPException(500, { message: "Failed to track order" });
    }
  }
}
