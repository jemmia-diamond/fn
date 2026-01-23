import RecallEventController from "controllers/larksuite/recall-event-controller";

export default class LarkWebhook {
  static async register(webhook: any) {
    const namespace = webhook.basePath("/lark");
    namespace.post("/recall/event", RecallEventController.create);
  }
}
