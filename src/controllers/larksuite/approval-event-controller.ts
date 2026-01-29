import LarkCipher from "services/larksuite/lark-cipher";
import BuyBackInstanceService from "services/larksuite/approval/instance/buyback-instance";
import * as Sentry from "@sentry/cloudflare";

export default class ApprovalEventController {
  static async create(c: any) {
    try {
      const body = await c.req.json();
      if (!body) {
        console.warn("Lark approval event missing body");
        return c.text("Bad Request", 400);
      }
      let eventBody = body;

      if (body.encrypt) {
        const secret = await c.env.JEMMIA_BOT_LARK_ENCRYPT_KEY_SECRET.get();
        const decryptedData = await LarkCipher.decryptEvent(
          body.encrypt,
          secret
        );
        eventBody = JSON.parse(decryptedData);
      }

      if (eventBody.type === "url_verification") {
        return c.json({ challenge: eventBody.challenge });
      }

      let eventPayload = null;

      if (eventBody.type === "event_callback" && eventBody.event?.type === "approval_instance") {
        eventPayload = eventBody.event;
      }

      if (eventPayload) {
        c.executionCtx.waitUntil(
          BuyBackInstanceService.handleApprovalWebhook(c.env, eventPayload)
            .catch((err: any) => {
              Sentry.captureException(err);
            })
        );
      }

      return c.text("OK", 200);
    } catch (error: any) {
      Sentry.captureException(error);
      return c.text("OK", 200);
    }
  }
}

