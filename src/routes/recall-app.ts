import RecallAuthController from "controllers/larksuite/recall-auth.controller";
import RecallEventController from "controllers/larksuite/recall-event.controller";

export default class RecallAppRoutes {
  static register(app) {
    app.get("/recall", RecallAuthController.index);
    app.get("/recall/login/lark", RecallAuthController.redirectToLark);
    app.get("/recall/callback", RecallAuthController.handleCallback);

    // Webhook for Lark Events
    app.post("/lark/recall/event", RecallEventController.create);
  }
}
