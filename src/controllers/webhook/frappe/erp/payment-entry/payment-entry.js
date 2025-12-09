export default class FrappeERPPaymentEntryController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const erpTopic = ctx.req.header("erp-topic") || "";

    await ctx.env["ERPNEXT_PAYMENT_ENTRY_QUEUE"].send({
      data,
      erpTopic
    });

    return ctx.json({ message: "Payment entry webhook received", status: 200 });
  }
}
