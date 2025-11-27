export default class CollectController {
  static async create(ctx) {
    const data = await ctx.req.json();
    await ctx.env["NOCO_COLLECT_QUEUE"].send(data);
    return ctx.json({ message: "Noco collect Received" });
  }
}
