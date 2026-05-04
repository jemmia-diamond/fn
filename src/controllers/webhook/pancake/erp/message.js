import { DebounceActions, DebounceService } from "src/durable-objects";
import { shouldReceiveWebhook } from "controllers/webhook/pancake/erp/utils";
import { retryQuery } from "services/utils/retry-utils";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();
    if (data.event_type === "messaging") {
      const receiveWebhook = shouldReceiveWebhook(data);

      if (!receiveWebhook) {
        return ctx.json({ message: "Message Ignored" });
      }

      await retryQuery(() => ctx.env["MESSAGE_QUEUE"].send(data));
      await retryQuery(() => ctx.env["PANCAKE_MESSAGE_WEBHOOK_DISPATCH_QUEUE"].send(data));

      const conversationId = data?.data?.conversation?.id;

      const key = `conversation-${conversationId}`;
      await DebounceService.debounce({
        env: ctx.env,
        key: key,
        data: data,
        actionType: DebounceActions.SEND_TO_MESSAGE_SUMMARY_QUEUE,
        delay: 30000
      });

      await DebounceService.debounce({
        env: ctx.env,
        key: key,
        data: data,
        actionType: DebounceActions.SEND_TO_PANCAKE_MESSAGE_LAST_INTERACTION_QUEUE,
        delay: 30000
      });
    }
    return ctx.json({ message: "Message Received" });
  }
}
