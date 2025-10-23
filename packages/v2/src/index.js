import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import errorTracker from "middlewares/error-tracker";
import errorHandler from "middlewares/error-handler";

import CorsService from "services/cors-service";

import Routes from "src/routes";

const app = new Hono();
const api = app.basePath("/api");
const publicApi = app.basePath("/public-api");
const webhook = app.basePath("/webhook");

app.use("*", errorTracker);
app.use("*", errorHandler);

// Apply CORS to routes using the service
api.use("*", CorsService.createCorsConfig());
publicApi.use("*", CorsService.createCorsConfig());

// Authentication
api.use("*",
  bearerAuth({
    verifyToken: async (token, c) => {
      const bearerToken = await c.env.BEARER_TOKEN_SECRET.get();

      return (token === bearerToken) || (token === c.env.BEARER_TOKEN);
    }
  })
);

// Routes registration
Routes.AppRoutes.register(app);
Routes.APIRoutes.register(api);
Routes.PublicAPIRoutes.register(publicApi);
Routes.WebhookRoutes.register(webhook);

export default app;
