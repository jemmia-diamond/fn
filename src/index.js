import { init, track } from "@middleware.io/agent-apm-worker";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import errorTracker from "middlewares/error-tracker";
import errorHandler from "middlewares/error-handler";

import loggrageLogger from "services/custom-logger";
import CorsService from "services/cors-service";

import Routes from "src/routes";
import queueHandler from "services/queue-handler";
import scheduleHandler from "services/schedule-handler";
import { DebounceDurableObject } from "src/durable-objects";

const app = new Hono();
const api = app.basePath("/api");
const publicApi = app.basePath("/public-api");
const webhook = app.basePath("/webhook");

app.use("*", async (c, next) => {
  if (c.env.MIDDLEWARE_API_KEY) {
    init({
      serviceName: c.env.MIDDLEWARE_SERVICE_NAME,
      accountKey: c.env.MIDDLEWARE_API_KEY,
      target: c.env.MIDDLEWARE_TARGET,
      consoleLogEnabled: false
    });
  }
  await next();
});

app.use(loggrageLogger(track));
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

// Cron trigger and Queue Integrations
export default {
  fetch: app.fetch,
  queue: queueHandler.queue,
  scheduled: scheduleHandler.scheduled
};

// Export Durable Object classes
export { DebounceDurableObject };
