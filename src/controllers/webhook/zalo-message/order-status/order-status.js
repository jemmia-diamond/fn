import * as Sentry from "@sentry/cloudflare";

export default class OrderStatusController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const templateId = await ctx.req.header("template_id");
    if (!templateId) {
      return ctx.json({ message: "Template ID is required", status: 400 });
    }
    data.template_id = Number(templateId);
    try {
      await ctx.env["ZALO_MESSAGE_QUEUE"].send(data);
      return ctx.json({ message: "Message sent to queue", status: 200 });
    } catch (e) {
      Sentry.captureException(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
