export default class ZaloPayTransactionController {
  static async create(ctx) {
    const data = await ctx.req.json();
    await ctx.env["SEPAY_TRANSACTION_QUEUE"].send({
      data,
      topic: "zalopay"
    });
    return ctx.json({ message: "ZaloPay Transaction Received" });
  }
};
