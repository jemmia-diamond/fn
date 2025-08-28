import Ecommerce from "services/ecommerce";
import { HTTPException } from "hono/http-exception";

export default class OrderTrackingController {
  static async show(ctx) {
    const { id } = ctx.req.param();
    if (!id) {
      throw new HTTPException(400, { message: "Order ID is required" });
    }

    const authorization = ctx.req.header("Authorization");
    let reqBearerToken = null;
    if (authorization && authorization.startsWith("Bearer ")) {
      reqBearerToken = authorization.split(" ")[1];
    }

    const orderTrackingService = new Ecommerce.OrderTrackingService(ctx.env);
    try {
      const orderDetails = await orderTrackingService.trackOrder(id, reqBearerToken);
      if (!orderDetails) {
        throw new HTTPException(200, { message: "Cannot find order" });
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
