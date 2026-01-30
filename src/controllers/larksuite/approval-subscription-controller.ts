import InstanceService from "services/larksuite/approval/instance/instance";

export default class ApprovalSubscriptionController {
  static async index(c: any) {
    const approvalCode = c.req.query("code");
    if (!approvalCode) {
      return c.json({ error: "Missing approval code" }, 400);
    }

    const response = await InstanceService.subscribe(c.env, approvalCode);
    return c.json({ message: "Subscribed successfully", data: response });
  }
}
