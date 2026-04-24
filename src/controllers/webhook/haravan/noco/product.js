import { DebounceActions, DebounceService } from "src/durable-objects";

export default class HaravanNocoProductController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const haravanTopic = ctx.req.header("x-haravan-topic");

    const slimData = {
      id: data.id,
      haravan_topic: haravanTopic,
      product_type: data.product_type || "",
      variants: (data.variants || []).map(v => ({
        id: v.id,
        sku: v.sku,
        title: v.title,
        inventory_advance: v.inventory_advance || {}
      }))
    };

    await DebounceService.debounce({
      env: ctx.env,
      key: `product-${slimData.id}`,
      data: slimData,
      actionType: DebounceActions.SEND_TO_HARAVAN_PRODUCT_QUEUE,
      delay: 3000
    });

    return ctx.json({ message: "Message sent to queue", status: 200 });
  };
};
