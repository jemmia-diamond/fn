import { DebounceService } from "src/durable-objects/debounce/debounce-service";
import { DebounceActions } from "src/durable-objects/debounce/debounce-action";

export default class FrappeERPSalesOrderController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const salesOrders = data.sales_orders && Array.isArray(data.sales_orders) ? data.sales_orders : [data];

    for (const order of salesOrders) {
      await DebounceService.debounce({
        env: ctx.env,
        key: `erp-sales-order-${order.name}`,
        data: order,
        actionType: DebounceActions.SEND_TO_ERPNEXT_SALES_ORDER_QUEUE
      });
    }

    return ctx.json({ message: "Sales order webhook received", status: 200 });
  }
}
