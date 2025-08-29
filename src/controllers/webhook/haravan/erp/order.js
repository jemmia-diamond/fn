import { HARAVAN_TOPIC } from "services/ecommerce/enum";

export default class HaravanERPOrderController {
  static async create(ctx) {
    // Receives the order events from haravan and sends them to the order queue
    const data = await ctx.req.json();
    data.haravan_topic = ctx.req.header("x-haravan-topic");
    try {
      if (data.haravan_topic === HARAVAN_TOPIC.PAID ) {
        await ctx.env["ZALO_MESSAGE_QUEUE"].send(data);
      } else if (data.haravan_topic === HARAVAN_TOPIC.CREATED) {
        const delayInSeconds = 1800; // 1800 seconds ~ 30 mins
        data.dispatchType = "DELAYED";
        await ctx.env["ZALO_MESSAGE_QUEUE"].send(data, { delaySeconds: delayInSeconds });
      }
      await ctx.env["ZALO_MESSAGE_QUEUE"].send(data);
      await ctx.env["ORDER_QUEUE"].send(data);
      return ctx.json({ message: "Message sent to queue", status: 200 });
    } catch (e) {
      console.error(e);
      return ctx.json({ message: e.message, status: 500 });
    };
  };
};
