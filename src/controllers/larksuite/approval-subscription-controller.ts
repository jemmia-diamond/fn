import InstanceService from "services/larksuite/approval/instance/instance";

import * as Sentry from "@sentry/cloudflare";

export default class ApprovalSubscriptionController {
  static async index(c: any) {
    try {
      const approvalCode = c.req.query("code");
      if (!approvalCode) {
        return c.json({ error: "Missing approval code" }, 400);
      }

      const response = await InstanceService.subscribe(c.env, approvalCode);
      return c.json({ message: "Subscribed successfully", data: response });
    } catch (error: any) {
      Sentry.captureException(error);
      return c.json({ error: "Subscription failed" }, 500);
    }
  }
}
