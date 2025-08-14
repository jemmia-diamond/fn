export default class HaravanERPOrderController {
  static async create(ctx) {
    // Receives the order events from haravan and sends them to the order queue
    const data = await ctx.req.json();
    data.haravan_topic = ctx.req.header("x-haravan-topic");
    try {
      await ctx.env["ORDER_QUEUE"].send(data);
      return ctx.json({ message: "Message sent to queue", status: 200 });
    } catch (e) {
      console.error(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
