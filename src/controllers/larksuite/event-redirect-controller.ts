import * as Sentry from "@sentry/cloudflare";
import LarkCipher from "services/larksuite/lark-cipher";
import BuyBackInstanceService from "services/larksuite/approval/instance/buyback-instance";
import { APPROVALS } from "services/larksuite/approval/constant";
import axios from "axios";

export default class EventRedirectController {
  static async create(c: any) {
    const body = await c.req.json();
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
      switch (eventPayload.approval_code) {
      case APPROVALS.BUYBACK_EXCHANGE.code:
        c.executionCtx.waitUntil(
          BuyBackInstanceService.handleApprovalWebhook(c.env, eventPayload)
        );
        break;
      case APPROVALS.AFFILIATE_PAYOUT_APPROVAL.code:
        await axios.post("https://partners.jemmia.vn/lark/event", eventPayload);
        break;
      default:
        Sentry.captureException(new Error("Unknown approval code"), {
          extra: {
            approval_code: eventPayload.approval_code
          }
        });
        break;
      }
    }

    return c.text("OK", 200);
  }
}
