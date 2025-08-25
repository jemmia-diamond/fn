import { HTTPException } from "hono/http-exception";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();
    try {
      if (data.event_type === "messaging") {
        await ctx.env["MESSAGE_SUMMARY_QUEUE"].send(data);
        await ctx.env["MESSAGE_QUEUE"].send(data);
      }
      return ctx.json({ message: "Message Received" });
    } catch {
      throw new HTTPException(500, "Failed to send message to queue");
    }
  }
}
