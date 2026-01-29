import RecallEventController from "controllers/larksuite/recall-event-controller";
import ApprovalEventController from "controllers/larksuite/approval-event-controller";

export default class LarkWebhook {
  static async register(webhook: any) {
    const namespace = webhook.basePath("/lark");
    namespace.post("/recall/event", RecallEventController.create);
    namespace.post("/approval/buyback", ApprovalEventController.create);
  }
}
