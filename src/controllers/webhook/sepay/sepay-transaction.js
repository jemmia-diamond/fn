import { SEPAY_WEBHOOK_TOPICS } from "services/erp/accounting/sepay-transaction/constants";

export default class SepayTransactionController {
  static async create(ctx) {
    const data = await ctx.req.json();
    data.topic = SEPAY_WEBHOOK_TOPICS.SEPAY;;
    await ctx.env["SEPAY_TRANSACTION_QUEUE"].send(data);
    return ctx.json({ message: "Sepay Transaction Received" });
  }
}
