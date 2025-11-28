export default class HaravanNocoProductController {
  static async create(ctx) {
    const data = await ctx.req.json();
    await ctx.env["HARAVAN_PRODUCT_QUEUE"].send(data);
    return ctx.json({ message: "Message sent to queue", status: 200 });
  };
};
