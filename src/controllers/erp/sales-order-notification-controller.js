import { HTTPException } from "hono/http-exception";
import ERP from "services/erp";

export default class SalesOrderNotificationController {
    static async create(ctx) {
        const data = await ctx.req.json();
        return ctx.json({ success: true, message: "Sales Order Notification Received" });
    }
}
