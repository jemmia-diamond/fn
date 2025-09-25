import { HTTPException } from "hono/http-exception";
import { MessageBatcherService } from "src/durable-objects";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();
    try {
      if (data.event_type === "messaging") {
        await ctx.env["MESSAGE_QUEUE"].send(data);
        await MessageBatcherService.queueMessage(ctx.env, data, "MESSAGE_SUMMARY_QUEUE");
      }
      return ctx.json({ message: "Message Received" });
    } catch {
      throw new HTTPException(500, "Failed to send message to queue");
    }
  }
}
