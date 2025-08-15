import Ecommerce from "services/ecommerce";
import { HTTPException } from "hono/http-exception";

export default class DeliveryTrackingController {
  static async show(ctx) {
    const id = ctx.req.query("bill_code");
    if (!id) {
      throw new HTTPException(400, { message: "Bill Code is required" });
    }
    const orderTrackingService = new Ecommerce.OrderTrackingService(ctx.env);
    try {
      const bill = await orderTrackingService.getNhatTinDeliveryStatus(id);
      if (!bill) {
        throw new HTTPException(404, { message: "Bill not found" });
      }
      return ctx.json(bill);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error tracking order:", error);
      throw new HTTPException(500, { message: "Failed to get bill detail" });
    }
  }
}
