import { SEPAY_WEBHOOK_TOPICS } from "services/erp/accounting/sepay-transaction/constants";
import * as Sentry from "@sentry/cloudflare";

export default class ZaloPayTransactionController {
  static async create(ctx) {
    try {
      const data = await ctx.req.json();
      console.warn("[ZaloPay Webhook] Received callback:", JSON.stringify(data));
      data.topic = SEPAY_WEBHOOK_TOPICS.ZALOPAY;
      await ctx.env["SEPAY_TRANSACTION_QUEUE"].send(data);
      return ctx.json({ return_code: 1, return_message: "success" });
    } catch (error) {
      console.warn("[ZaloPay Webhook] Error processing callback:", error);
      Sentry.captureException(error);
      return ctx.json({ return_code: 2, return_message: error.message || "failed" });
    }
  }
}
