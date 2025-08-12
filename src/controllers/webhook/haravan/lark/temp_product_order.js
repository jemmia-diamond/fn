export default class HaravanLarkTempProductOrderController {
  static async create(ctx) {
    // Receives the order events from haravan and sends them to the order queue
    let data;
    try {
      data = await ctx.req.json();
    } catch {
      return ctx.json({ message: "Invalid JSON body" }, 400);
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return ctx.json({ message: "Payload must be an object" }, 400);
    }
    try {
      await ctx.env.ORDER_QUEUE.send(data, { queueName: "order" });
      return ctx.json({ message: "Message sent to queue" }, 200);
    } catch (e) {
      console.error(e);
    };
    return ctx.json({ message: "Failed to enqueue message" }, 500);
  };
};
  
