import { verifyStaticTokenAuth } from "auth/static-token-auth";
import ShieldEventController from "controllers/jemmia-shield/shield-event-controller";
import LarkAppointmentController from "controllers/larksuite/appointment-controller";
import EventRedirectController from "controllers/larksuite/event-redirect-controller";
import LarkApprovalOrdersController from "controllers/larksuite/lark-approval-orders-controller";

export default class LarkWebhook {
  static async register(webhook: any) {
    const namespace = webhook.basePath("/lark");
    namespace.use("/appointment", verifyStaticTokenAuth("X-LARK-AUTH-TOKEN", "BEARER_TOKEN"));
    namespace.post("/recall/event", ShieldEventController.create);
    namespace.post("/event/redirect", EventRedirectController.create);
    namespace.post(
      "/approval/orders-options",
      LarkApprovalOrdersController.create
    );
    namespace.post(
      "/appointment",
      LarkAppointmentController.create
    );
  }
}
