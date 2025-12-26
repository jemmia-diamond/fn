import { TOPICS } from "services/erp/accounting/sepay-transaction/constants";

export default class ZaloPayTransactionController {
  static async create(ctx) {
    const data = await ctx.req.json();
    data.topic = TOPICS.ZALOPAY;
    await ctx.env["SEPAY_TRANSACTION_QUEUE"].send(data);
    return ctx.json({ message: "ZaloPay Transaction Received" });
  }
};
