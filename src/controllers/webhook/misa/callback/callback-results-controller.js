import * as Sentry from "@sentry/cloudflare";

export default class CallbackResultsController {
  static ONE_MINUTE_DELAY = 60;

  static async create(ctx) {
    try {
      const payload = await ctx.req.json();
      await ctx.env["MISA_QUEUE"].send(payload, { delaySeconds: this.ONE_MINUTE_DELAY });
      return ctx.json({ message: "Message receive", status: 200 });
    } catch (e) {
      Sentry.captureException(e);
      return ctx.json({ message: "Internal server error", status: 500 });
    };
  };
};
