import RecallAuthController from "controllers/larksuite/recall-auth.controller";
import RecallEventController from "controllers/larksuite/recall-event.controller";

export default class RecallAppRoutes {
  static register(app) {
    app.get("/recall", RecallAuthController.index);
    // eslint-disable-next-line restful/routes
    app.get("/recall/login/lark", RecallAuthController.redirectToLark);
    // eslint-disable-next-line restful/routes
    app.get("/recall/callback", RecallAuthController.handleCallback);

    // Webhook for Lark Events
    app.post("/lark/recall/event", RecallEventController.create);
  }
}
