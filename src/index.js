import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import errorTracker from "./services/error-tracker";
import queueHandler from "./queues/queue-handler";
import Routes from "./routes";

import scheduleHandler from "./schedules/schedule-handler";
import verifyAIHubWebhook from "./auth/aihub-auth";
import Routes from "./routes";

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

webhook.use("*", some(
  verifyHaravanWebhook,
  verifyAIHubWebhook
));

// Routes registration
Routes.APIRoutes.register(api);
Routes.WebhookRoutes.register(webhook);
Routes.register(api);
Routes.register(webhook)

export default {
  fetch: app.fetch,
  scheduled: scheduleHandler.scheduled
};
