import RedirectController from "controllers/redirect-controller";
import JemmiaShieldAuthController from "controllers/jemmia-shield/shield-controller";
import JemmiaShieldRedirectController from "controllers/jemmia-shield/shield-redirect-controller";
import JemmiaShieldCallbackController from "controllers/callback/jemmia-shield-callback-controller";
import JemmiaShieldGroupBotGrantController from "controllers/jemmia-shield/shield-group-bot-grant-controller";

import JemmiaShieldMessageController from "controllers/jemmia-shield/shield-message-controller";

export default class AppRoutes {
  static register(app) {
    app.get("/redirects/:name", RedirectController.show);

    app.get("/jemmia-shield", JemmiaShieldAuthController.index);
    app.get("/jemmia-shield/login/lark", JemmiaShieldRedirectController.index);
    app.get("/jemmia-shield/callback", JemmiaShieldCallbackController.index);
    app.post("/jemmia-shield/add-bot", JemmiaShieldGroupBotGrantController.create);
    app.get("/jemmia-shield/message-recall/view", JemmiaShieldMessageController.show);
  };
};
