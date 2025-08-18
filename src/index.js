import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import Routes from "src/routes";
import errorTracker from "services/error-tracker";
import loggrageLogger from "services/custom-logger";
import CorsService from "services/cors-service";

import queueHandler from "services/queue-handler";
import scheduleHandler from "services/schedule-handler";

const app = new Hono();
const api = app.basePath("/api");
const publicApi = app.basePath("/public-api");
const webhook = app.basePath("/webhook");

// Error tracking
app.use("*", errorTracker);
app.use(loggrageLogger());

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

// Cron trigger and Queue Integrations
export default {
  fetch: app.fetch,
  queue: queueHandler.queue,
  scheduled: scheduleHandler.scheduled
};
