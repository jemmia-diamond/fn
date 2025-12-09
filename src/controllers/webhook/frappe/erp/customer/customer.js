export default class FrappeERPCustomerController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const erpTopic = ctx.req.header("erp-topic") || "";
    await ctx.env.ERPNEXT_CUSTOMER_QUEUE.send({ data, erpTopic });
    return ctx.json({ message: "Customer webhook received", status: 200 });
  }
}
