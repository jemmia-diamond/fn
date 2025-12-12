export default class FrappeERPCustomerController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const erpTopic = ctx.req.header("erp-topic") || null;
    await ctx.env.ERPNEXT_SELLING_QUEUE.send({ data, erpTopic });
    return ctx.json({ message: "Customer webhook received", status: 200 });
  }
}
