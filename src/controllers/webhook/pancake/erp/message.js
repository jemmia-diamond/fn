import { HTTPException } from "hono/http-exception";
import { DebounceService } from "src/durable-objects";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();
    try {
      if (data.event_type === "messaging") {
        await ctx.env["MESSAGE_QUEUE"].send(data);
        const conversationId = data?.data?.conversation?.id;

        if (!conversationId) {
          throw new Error("Conversation ID is required for message batching");
        }

        const key = `conversation-${conversationId}`;

        await DebounceService.debounceToQueue(
          ctx.env,
          key,
          data,
          "MESSAGE_SUMMARY_QUEUE",
          3000
        );

      }
      return ctx.json({ message: "Message Received" });
    } catch {
      throw new HTTPException(500, "Failed to send message to queue");
    }
  }
}
