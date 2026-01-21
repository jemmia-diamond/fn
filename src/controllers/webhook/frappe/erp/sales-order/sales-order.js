import { DebounceService } from "src/durable-objects/debounce/debounce-service";
import { DebounceActions } from "src/durable-objects/debounce/debounce-action";

export default class FrappeERPSalesOrderController {
  static async create(ctx) {
    const data = await ctx.req.json();
    await DebounceService.debounce({
      env: ctx.env,
      key: `erp-sales-order-${data.name}`,
      data,
      actionType: DebounceActions.SEND_TO_ERPNEXT_SALES_ORDER_QUEUE
    });
    return ctx.json({ message: "Sales order webhook received", status: 200 });
  }
}
