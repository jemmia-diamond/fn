import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import verifyHaravanWebhook from "./auth/haravan-auth";
import Routes from "./routes";
import errorTracker from "./services/error-tracker";
import queueHandler from "./queues/queue-handler";

const app = new Hono();
const api = app.basePath("/api");
const webhook = app.basePath("/webhook");

// Error tracking
app.use("*", errorTracker);

// Authentication
api.use("*",
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === c.env.BEARER_TOKEN;
    }
  })
);

webhook.use("*", verifyHaravanWebhook);

// Routes registration
Routes.APIRoutes.register(api);
Routes.WebhookRoutes.register(webhook);

// Cron trigger and Queue Integrations
export default {
  fetch: app.fetch,
  queue: queueHandler.queue
};
