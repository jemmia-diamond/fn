import RedirectController from "controllers/redirect-controller";
import JemmiaShieldAuthController from "controllers/jemmia-shield/jemmia-shield-controller";
import JemmiaShieldRedirectController from "controllers/jemmia-shield/jemmia-shield-redirect-controller";
import JemmiaShieldCallbackController from "controllers/jemmia-shield/jemmia-shield-callback-controller";
import JemmiaShieldBotController from "controllers/jemmia-shield/jemmia-shield-bot-controller";

import JemmiaShieldMessageViewController from "controllers/jemmia-shield/jemmia-shield-message-view-controller";

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
