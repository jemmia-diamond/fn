export default class FrappeERPSalesOrderController {
  static async create(ctx) {
    const data = await ctx.req.json();
    data.doc_event = ctx.req.header("Doc-Event");
    await ctx.env["ERPNEXT_SALES_ORDER_QUEUE"].send(data);
    return ctx.json({ message: "Sales order webhook received", status: 200 });
  }
}
