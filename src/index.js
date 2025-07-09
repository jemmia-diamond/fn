import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";

import Routes from "./routes";
import errorTracker from "./services/error-tracker";
import loggrageLogger from "./services/custom-logger";

import queueHandler from "./services/queue-handler";
import scheduleHandler from "./services/schedule-handler";

const app = new Hono();
const api = app.basePath("/api");
const webhook = app.basePath("/webhook");

// Error tracking
app.use("*", errorTracker);
app.use(loggrageLogger());

// CORS
api.use("*", cors({
  origin: (origin, c) => {
    const corsOrigin = c.env.CORS_ORIGINS.split(",");

    if (corsOrigin.includes(origin)) {
      return origin;
    }

    // Handle wildcard, eg: *.jemmia.vn
    corsOrigin.filter((o) => o.startsWith("*.")).forEach((o) => {
      if (origin.endsWith(o.slice(1))) {
        return origin;
      }
    });

    return "*";
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
}));

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
Routes.APIRoutes.register(api);
Routes.WebhookRoutes.register(webhook);

// Cron trigger and Queue Integrations
export default {
  fetch: app.fetch,
  queue: queueHandler.queue,
  scheduled: scheduleHandler.scheduled
};
