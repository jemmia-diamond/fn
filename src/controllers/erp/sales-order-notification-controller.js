import ERP from "services/erp";

export default class SalesOrderNotificationController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const salesOrderService = new ERP.Selling.SalesOrderService(ctx.env);
    await salesOrderService.sendNotificationToLark(data);
    return ctx.json({ success: true, message: "Send notification successfully" });
  }
}
