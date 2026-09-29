import * as Sentry from "@sentry/cloudflare";

import { DebounceActions, DebounceService } from "src/durable-objects";
import {
  shouldReceiveWebhook,
  shouldSendToCustomerLens
} from "controllers/webhook/pancake/erp/utils";

export default class PancakeERPMessageController {
  static async create(ctx) {
    const data = await ctx.req.json();

    if (data.event_type !== "messaging") {
      return ctx.json({ message: "Message Received" });
    }

    const receiveWebhook = shouldReceiveWebhook(data);

    // Pancake times this response and disables the webhook when it is slow,
    // so acknowledge first and do the fan-out afterwards. Nothing here needs
    // a result from the queues or the debounce durable objects.
    ctx.executionCtx.waitUntil(
      PancakeERPMessageController.dispatch(ctx.env, data, receiveWebhook)
    );

    return ctx.json({
      message: receiveWebhook ? "Message Received" : "Message Ignored"
    });
  }

  /**
   * Fans the webhook payload out to the queues and debounce durable objects.
   *
   * Runs after the response, so nothing upstream will retry a failure: every
   * rejection is reported rather than swallowed.
   */
  static async dispatch(env, data, receiveWebhook) {
    const pageId = data?.page_id;
    const senderId = data?.data?.message?.from?.id;
    const conversationId = data?.data?.conversation?.id;
    const isSalesMessage = pageId && senderId && pageId == senderId;

    // Queue sends report nothing on their own, so their failures are captured
    // below. DebounceService already reports to Sentry before it rethrows, so
    // capturing those again would double-count every debounce failure.
    const sends = [];
    const debounces = [];

    if (shouldSendToCustomerLens(data, env)) {
      sends.push(env["CUSTOMER_LENS_QUEUE"].send(data));
    }

    if (isSalesMessage && conversationId) {
      sends.push(env["PANCAKE_SALES_MESSAGE_QUEUE"].send(data));
    }

    if (receiveWebhook) {
      sends.push(env["MESSAGE_QUEUE"].send(data));
      sends.push(env["PANCAKE_MESSAGE_WEBHOOK_DISPATCH_QUEUE"].send(data));

      debounces.push(
        DebounceService.debounce({
          env,
          key: `summary-conversation-${conversationId}`,
          data: data,
          actionType: DebounceActions.SEND_TO_MESSAGE_SUMMARY_QUEUE,
          delay: 30000
        })
      );

      debounces.push(
        DebounceService.debounce({
          env,
          key: `interaction-conversation-${conversationId}`,
          data: data,
          actionType:
            DebounceActions.SEND_TO_PANCAKE_MESSAGE_LAST_INTERACTION_QUEUE,
          delay: 30000
        })
      );
    }

    // Settled, not all: one failing task must not drop the others.
    const [sendResults] = await Promise.all([
      Promise.allSettled(sends),
      Promise.allSettled(debounces)
    ]);

    for (const result of sendResults) {
      if (result.status === "rejected") {
        Sentry.captureException(result.reason);
      }
    }
  }
}
