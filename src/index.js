import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";

import Routes from "./routes";
import errorTracker from "./services/error-tracker";
import loggrageLogger from "./services/custom-logger";

import queueHandler from "./services/queue-handler";
import scheduleHandler from "./services/schedule-handler";

import {
  JEMMIA_ORIGIN,
  PANCAKE_ORIGIN
} from "./config/origin";

const app = new Hono();
const api = app.basePath("/api");
const webhook = app.basePath("/webhook");

// Error tracking
app.use("*", errorTracker);
app.use(loggrageLogger());

// CORS
api.use("*", cors({
  origin: [
    JEMMIA_ORIGIN,
    PANCAKE_ORIGIN
  ]
}));

// Authentication
api.use("*",
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === c.env.BEARER_TOKEN;
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
