import { Hono } from "hono";
import Koc from "controllers/koc";
import CorsService from "services/cors-service";

export default class KocRoutes {
  static register(app) {
    const koc = new Hono();

    // CORS specifically allowing frontend
    koc.use("*", CorsService.createCorsConfig());

    // Public auth endpoint
    koc.post("/auth/login", Koc.KocAuthController.create);

    // Protected endpoints requiring KOC JWT
    const protectedKoc = new Hono();
    protectedKoc.use("*", Koc.KocAuthController.requireAuth);

    protectedKoc.get("/sessions", Koc.KocSessionsController.index);
    protectedKoc.get("/dashboard/stats", Koc.KocDashboardStatsController.show);
    protectedKoc.get("/leads", Koc.KocLeadsController.index);

    koc.route("/", protectedKoc);

    // Mount at /api/koc and /koc
    app.route("/api/koc", koc);
    app.route("/koc", koc);
  }
}
