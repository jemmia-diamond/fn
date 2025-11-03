export default class CallbackResultsController {
  static async create(ctx) {
    try {
      const payload = await ctx.req.json();
      await ctx.env["MISA_QUEUE"].send(payload);
      return ctx.json({ message: "Message receive", status: 200 });
    } catch (e) {
      console.error(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
