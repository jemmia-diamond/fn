import RecallEventController from "controllers/larksuite/recall-event-controller";
import EventRedirectController from "controllers/larksuite/event-redirect-controller";

export default class LarkWebhook {
  static async register(webhook: any) {
    const namespace = webhook.basePath("/lark");
    namespace.post("/recall/event", RecallEventController.create);
    namespace.post("/event/redirect", EventRedirectController.create);
  }
}
