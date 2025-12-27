export default class FrappeERPSalesOrderItemController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const erpTopic = "update-item-policy";
    await ctx.env.ERPNEXT_SELLING_QUEUE.send({
      data,
      erpTopic,
      doctype: "SalesOrderItem"
    });
    return ctx.json({ message: "Sales Order Item webhook received", status: 200 });
  }
}
