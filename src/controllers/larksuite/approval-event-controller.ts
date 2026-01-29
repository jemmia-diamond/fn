import BuyBackInstanceService from "services/larksuite/approval/instance/buyback-instance";

export default class ApprovalEventController {
  static async create(c: any) {
    try {
      const body = await c.req.json();

      if (body.type === "url_verification") {
        return c.json({ challenge: body.challenge });
      }

      if (body.header?.event_type === "approval.instance.status_changed") {
        c.executionCtx.waitUntil(
          BuyBackInstanceService.handleApprovalWebhook(c.env, body.event)
            .catch((err: any) => console.warn("Error processing approval event:", err))
        );
      }

      return c.text("OK", 200);
    } catch (error: any) {
      console.warn("Lark Approval Event Error:", error.message);
      return c.text("Internal Server Error", 500);
    }
  }
}

