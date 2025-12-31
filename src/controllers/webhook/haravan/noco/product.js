import { DebounceActions, DebounceService } from "src/durable-objects";

export default class HaravanNocoProductController {
  static async create(ctx) {
    const data = await ctx.req.json();
    data.haravan_topic = ctx.req.header("x-haravan-topic");

    if (data.body_html) delete data.body_html;
    if (data.body_plain) delete data.body_plain;
    if (data.images) delete data.images;

    await DebounceService.debounce({
      env: ctx.env,
      key: `product-${data.id}`,
      data,
      actionType: DebounceActions.SEND_TO_HARAVAN_PRODUCT_QUEUE,
      delay: 3000
    });

    return ctx.json({ message: "Message sent to queue", status: 200 });
  };
};
