import RedirectController from "controllers/redirect-controller";
import ShieldAuthController from "controllers/jemmia-shield/shield-controller";
import ShieldRedirectController from "controllers/jemmia-shield/shield-redirect-controller";
import JemmiaShieldCallbackController from "controllers/callback/jemmia-shield-callback-controller";
import ShieldGroupBotGrantController from "controllers/jemmia-shield/shield-group-bot-grant-controller";

import ShieldMessageController from "controllers/jemmia-shield/shield-message-controller";

export default class AppRoutes {
  static register(app) {
    app.get("/redirects/:name", RedirectController.show);

    app.get("/jemmia-shield", ShieldAuthController.index);
    app.get("/jemmia-shield/login/lark", ShieldRedirectController.index);
    app.get("/jemmia-shield/callback", JemmiaShieldCallbackController.index);
    app.post("/jemmia-shield/add-bot", ShieldGroupBotGrantController.create);
    app.get("/jemmia-shield/message-recall/view", ShieldMessageController.show);
  };
};
