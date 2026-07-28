import { DebounceActions, DebounceService } from "src/durable-objects";
import { shouldReceiveWebhook, shouldSendToCustomerLens } from "controllers/webhook/pancake/erp/utils";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();
    if (data.event_type === "messaging") {
      if (shouldSendToCustomerLens(data)) {
        await ctx.env["CUSTOMER_LENS_QUEUE"].send(data);
      }
      const receiveWebhook = shouldReceiveWebhook(data);

      if (!receiveWebhook) {
        return ctx.json({ message: "Message Ignored" });
      }

      await ctx.env["MESSAGE_QUEUE"].send(data);
      await ctx.env["PANCAKE_MESSAGE_WEBHOOK_DISPATCH_QUEUE"].send(data);

      const conversationId = data?.data?.conversation?.id;

      await DebounceService.debounce({
        env: ctx.env,
        key: `summary-conversation-${conversationId}`,
        data: data,
        actionType: DebounceActions.SEND_TO_MESSAGE_SUMMARY_QUEUE,
        delay: 30000
      });

      await DebounceService.debounce({
        env: ctx.env,
        key: `interaction-conversation-${conversationId}`,
        data: data,
        actionType: DebounceActions.SEND_TO_PANCAKE_MESSAGE_LAST_INTERACTION_QUEUE,
        delay: 30000
      });
    }
    return ctx.json({ message: "Message Received" });
  }
}
