import Ecommerce from "services/ecommerce";
import { HTTPException } from "hono/http-exception";

export default class OrderTrackingController {
  static async show(ctx) {
    const { id } = ctx.req.param();
    if (!id) {
      throw new HTTPException(400, { message: "Order ID is required" });
    }

    const authorization = ctx.req.header("Authorization");
    let isAuthorizedAccess = false;
    if (authorization && authorization.startsWith("Bearer ")) {
      const reqBearerToken = authorization.split(" ")[1];
      const bearerToken = await ctx.env.BEARER_TOKEN_SECRET.get();
      if (reqBearerToken !== bearerToken && reqBearerToken !== ctx.env.BEARER_TOKEN) {
        throw new HTTPException(400, { message: "Invalid Authorization header format" });
      }
      isAuthorizedAccess = true;
    }

    const orderTrackingService = new Ecommerce.OrderTrackingService(ctx.env);
    try {
      const orderDetails = await orderTrackingService.trackOrder(id, isAuthorizedAccess);
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
