export default class PancakeERPMessageController {
  static async create(ctx) {
    const _data = await ctx.req.json();
    return ctx.json({ message: "Message Received" });
  }
}
