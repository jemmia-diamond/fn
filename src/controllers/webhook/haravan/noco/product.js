export default class HaravanNocoProductController {
  static async create(ctx) {
    const data = await ctx.req.json();
    data.haravan_topic = ctx.req.header("x-haravan-topic");

    if (data.body_html) delete data.body_html;
    if (data.body_plain) delete data.body_plain;
    if (data.images) delete data.images;

    await ctx.env["HARAVAN_PRODUCT_QUEUE"].send(data);
    return ctx.json({ message: "Message sent to queue", status: 200 });
  };
};
