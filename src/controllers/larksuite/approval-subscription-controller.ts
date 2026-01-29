import InstanceService from "services/larksuite/approval/instance/instance";
import { APPROVALS } from "services/larksuite/approval/constant";

export default class ApprovalSubscriptionController {
  static async index(c: any) {
    try {
      const approvalCode = c.req.query("code") || APPROVALS.BUYBACK_EXCHANGE.code;
      const response = await InstanceService.subscribe(c.env, approvalCode);
      return c.json({ message: "Subscribed successfully", data: response });
    } catch (error: any) {
      console.warn("Subscription Error:", error);
      return c.json({ error: error.message }, 500);
    }
  }
}
