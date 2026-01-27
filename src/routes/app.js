import RedirectController from "controllers/redirect-controller";
import RecallAuthController from "controllers/larksuite/recall-auth-controller";
import RecallRedirectController from "controllers/larksuite/recall-redirect-controller";
import RecallCallbackController from "controllers/larksuite/recall-callback-controller";

export default class AppRoutes {
  static register(app) {
    app.get("/redirects/:name", RedirectController.show);

    app.get("/auth/recall", RecallAuthController.index);
    app.get("/auth/recall/login/lark", RecallRedirectController.index);
    app.get("/auth/recall/callback", RecallCallbackController.index);
  };
};
