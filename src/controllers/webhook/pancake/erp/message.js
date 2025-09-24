import { HTTPException } from "hono/http-exception";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();
    try {
      if (data.event_type === "messaging") {
        await ctx.env["MESSAGE_QUEUE"].send(data);
        const key = `conversation-${data?.data?.conversation?.id}`;
        const durableObjectId = ctx.env.MESSAGE_BATCHER.idFromName(key);
        const durableObject = ctx.env.MESSAGE_BATCHER.get(durableObjectId);
        await durableObject.fetch(ctx.env.HOST, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: key,
            data: data,
            delay: 3000,
            sendType: "MESSAGE_SUMMARY_QUEUE"
          })
        });
      }
      return ctx.json({ message: "Message Received" });
    } catch {
      throw new HTTPException(500, "Failed to send message to queue");
    }
  }
}
