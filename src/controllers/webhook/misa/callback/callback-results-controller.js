import MisaWebhookHandler from "services/misa/webhook-handler";

export default class CallbackResultsController {
  static async create(ctx) {
    try {
      const payload = await ctx.req.json();
      await new MisaWebhookHandler(ctx.env).handleWebhook(payload);

      return ctx.json({ message: "Message receive", status: 200 });
    } catch (e) {
      console.error(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
