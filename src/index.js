import "polyfills/bigint";

import * as Sentry from "@sentry/cloudflare";

import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";

import Routes from "src/routes";
import { DebounceDurableObject } from "src/durable-objects";

import errorTracker from "middlewares/error-tracker";
import errorHandler from "middlewares/error-handler";

import CorsService from "services/cors-service";
import queueHandler from "services/queue-handler";
import scheduleHandler from "services/schedule-handler";
import loggrageLogger from "services/custom-logger";

const app = new Hono()
  // Add an onError hook to report unhandled exceptions to Sentry.
  .onError((err, c) => {
    // Report _all_ unhandled errors.
    Sentry.captureException(err);
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    // Or just report errors which are not instances of HTTPException
    // Sentry.captureException(err);
    return c.json({ error: "Internal server error" }, 500);
  });

const api = app.basePath("/api");
const publicApi = app.basePath("/public-api");
const webhook = app.basePath("/webhook");

app.use(loggrageLogger());
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

// Cron trigger and Queue Integrations, wrapped with Sentry
export default Sentry.withSentry(
  (env) => {
    // Use SENTRY_RELEASE from environment variable to match with sourcemaps upload
    const release = env.SENTRY_RELEASE;
    return {
      dsn: env.SENTRY_DSN,
      release: release,
      sendDefaultPii: true,
      tracesSampleRate: 0,
      profilesSampleRate: 0
    };
  },
  {
    fetch: app.fetch,
    queue: queueHandler.queue,
    scheduled: scheduleHandler.scheduled
  }
);

// Export Durable Object classes
export { DebounceDurableObject };
