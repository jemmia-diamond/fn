import Ecommerce from "services/ecommerce";
import { HTTPException } from "hono/http-exception";
import { isInteger } from "services/utils/num-helper";

export default class OrderTrackingController {
  static async show(ctx) {
    const { id } = ctx.req.param();
    if (!id) {
      return ctx.json({ message: "Invalid order ID" }, 400 );
    }

    if (!isInteger(id)) {
      return ctx.json({ message: "Invalid order ID" }, 422 );
    }

    const authorization = ctx.req.header("Authorization");
    let reqBearerToken = null;
    if (authorization && authorization.startsWith("Bearer ")) {
      reqBearerToken = authorization.split(" ")[1];
    }

    const orderTrackingService = new Ecommerce.OrderTrackingService(ctx.env);
    try {
      const orderDetails = await orderTrackingService.trackOrder(
        id,
        reqBearerToken
      );
      if (!orderDetails) {
        return ctx.json({ error_code: "order_not_found" }, 404);
      }
      return ctx.json(orderDetails);
    } catch (error) {
      if (error instanceof HTTPException) {
        return ctx.json({ error_code: error.message }, error.status);
      }
      console.error("Error tracking order:", error);
      return ctx.json({ message: "Internal Server Error" }, 500);
    }
  }
}
