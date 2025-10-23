import RedirectController from "controllers/redirect-controller";

export default class AppRoutes {
  static register(app) {
    app.get("/redirects/:name", RedirectController.show);
  };
};
