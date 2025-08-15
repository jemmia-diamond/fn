export default class OrderStatusController {
  static async create(ctx) {
    const data = await ctx.req.json();
    data.order_status = "paid";
    try {
      await ctx.env["ZALO_MESSAGE_QUEUE"].send(data);
      return ctx.json({ message: "Message sent to queue", status: 200 });
    } catch (e) {
      console.error(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
