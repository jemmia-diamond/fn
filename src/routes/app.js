import RedirectController from "controllers/redirect-controller";

export default class AppRoutes {
  static register(app) {
    app.use("/redirects/:name", RedirectController.show);
  };
};
