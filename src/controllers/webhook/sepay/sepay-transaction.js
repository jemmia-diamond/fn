export default class SepayTransactionController {
  static async create(ctx) {
    const data = await ctx.req.json();
    await ctx.env["SEPAY_TRANSACTION_QUEUE"].send({
      data,
      topic: "sepay"
    });
    return ctx.json({ message: "Sepay Transaction Received" });
  }
}
