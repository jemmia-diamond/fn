import RedirectController from "controllers/redirect-controller";
import RecallAuthController from "controllers/larksuite/recall-auth.controller";

export default class AppRoutes {
  static register(app) {
    app.get("/redirects/:name", RedirectController.show);

    app.get("/recall", RecallAuthController.index);
    // eslint-disable-next-line
    app.get("/recall/login/lark", RecallAuthController.redirectToLark);
    // eslint-disable-next-line
    app.get("/recall/callback", RecallAuthController.handleCallback);
  };
};
