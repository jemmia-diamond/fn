import RedirectController from "controllers/redirect-controller";
import RecallAuthController from "controllers/larksuite/recall-auth-controller";
import RecallRedirectController from "controllers/larksuite/recall-redirect-controller";
import RecallCallbackController from "controllers/larksuite/recall-callback-controller";
import LarkShieldBotController from "controllers/larksuite/lark-shield-bot-controller";

import RecallMessageViewController from "controllers/larksuite/recall-message-view-controller";

export default class AppRoutes {
  static register(app) {
    app.get("/redirects/:name", RedirectController.show);

    app.get("/auth/recall", RecallAuthController.index);
    app.get("/auth/recall/login/lark", RecallRedirectController.index);
    app.get("/auth/recall/callback", RecallCallbackController.index);
    app.post("/auth/recall/add-bot", LarkShieldBotController.create);
    app.get("/lark/message-recall/view", RecallMessageViewController.show);
  };
};
