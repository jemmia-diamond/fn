import RedirectController from "controllers/redirect-controller";
import JemmiaShieldAuthController from "controllers/larksuite/jemmia-shield-controller";
import JemmiaShieldRedirectController from "controllers/larksuite/jemmia-shield-redirect-controller";
import JemmiaShieldCallbackController from "controllers/larksuite/jemmia-shield-callback-controller";
import JemmiaShieldBotController from "controllers/larksuite/jemmia-shield-bot-controller";

import JemmiaShieldMessageViewController from "controllers/larksuite/jemmia-shield-message-view-controller";

export default class AppRoutes {
  static register(app) {
    app.get("/redirects/:name", RedirectController.show);

    app.get("/jemmia-shield", JemmiaShieldAuthController.index);
    app.get("/jemmia-shield/login/lark", JemmiaShieldRedirectController.index);
    app.get("/jemmia-shield/callback", JemmiaShieldCallbackController.index);
    app.post("/jemmia-shield/add-bot", JemmiaShieldBotController.create);
    app.get("/jemmia-shield/message-recall/view", JemmiaShieldMessageViewController.show);
  };
};
