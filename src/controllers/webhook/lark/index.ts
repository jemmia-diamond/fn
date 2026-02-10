import JemmiaShieldEventController from "controllers/jemmia-shield/shield-event-controller";
import EventRedirectController from "controllers/larksuite/event-redirect-controller";
import LarkApprovalOrdersController from "controllers/larksuite/lark-approval-orders-controller";

export default class LarkWebhook {
  static async register(webhook: any) {
    const namespace = webhook.basePath("/lark");
    namespace.post("/recall/event", JemmiaShieldEventController.create);
    namespace.post("/event/redirect", EventRedirectController.create);
    namespace.post(
      "/approval/orders-options",
      LarkApprovalOrdersController.create
    );
  }
}
