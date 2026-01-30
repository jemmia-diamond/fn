import LarkCipher from "services/larksuite/lark-cipher";
import BuyBackInstanceService from "services/larksuite/approval/instance/buyback-instance";

export default class ApprovalBuybackController {
  static async create(c: any) {
    const body = await c.req.json();
    if (!body) {
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
      );
    }

    return c.text("OK", 200);
  }
}

