import { DebounceActions, DebounceService } from "src/durable-objects";
import { shouldReceiveWebhook } from "controllers/webhook/pancake/erp/utils";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();
    if (data.event_type === "messaging") {
      const receiveWebhook = shouldReceiveWebhook(data);

      if (!receiveWebhook) {
        return ctx.json({ message: "Message Ignored" });
      }

      await ctx.env["MESSAGE_QUEUE"].send(data);

      const conversationId = data?.data?.conversation?.id;

      const key = `conversation-${conversationId}`;
      await DebounceService.debounce({
        env: ctx.env,
        key: key,
        data: data,
        actionType: DebounceActions.SEND_TO_MESSAGE_SUMMARY_QUEUE,
        delay: 30000
      });
    }
    return ctx.json({ message: "Message Received" });
  }
}
