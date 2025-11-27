import * as Sentry from "@sentry/cloudflare";

export default class HaravanNocoProductController {
  static async create(ctx) {
    const data = await ctx.req.json();
    try {
      await ctx.env["HARAVAN_PRODUCT_QUEUE"].send(data);
      return ctx.json({ message: "Message sent to queue", status: 200 });
    } catch (e) {
      Sentry.captureException(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
