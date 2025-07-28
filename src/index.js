import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";

import Routes from "src/routes";
import errorTracker from "services/error-tracker";
import loggrageLogger from "services/custom-logger";

import queueHandler from "services/queue-handler";
import scheduleHandler from "services/schedule-handler";

const app = new Hono();
const api = app.basePath("/api");
const webhook = app.basePath("/webhook");

// Error tracking
app.use("*", errorTracker);
app.use(loggrageLogger());

// CORS
// api.use("*", cors({
//   origin: (origin, c) => {
//     const corsOrigin = c.env.CORS_ORIGINS.split(",");

//     if (corsOrigin.includes(origin)) {
//       return origin;
//     }

//     // Handle wildcard, eg: *.jemmia.vn
//     for (const o of corsOrigin.filter((o) => o.startsWith("https://*.") )) {
//       const baseDomain = o.replace("https://*.", "");

//       // Allow both wildcard subdomains and the base domain itself
//       if (origin.endsWith(`.${baseDomain}`) || origin === `https://${baseDomain}`) {
//         return origin;
//       }
//     }

//     return null;
//   },
//   allowHeaders: ["Content-Type", "Authorization"],
//   allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
// }));

// Authentication
// api.use("*",
//   bearerAuth({
//     verifyToken: async (token, c) => {
//       const bearerToken = await c.env.BEARER_TOKEN_SECRET.get();

//       return (token === bearerToken) || (token === c.env.BEARER_TOKEN);
//     }
//   })
// );

// Routes registration
Routes.APIRoutes.register(api);
Routes.WebhookRoutes.register(webhook);

// Cron trigger and Queue Integrations
export default {
  fetch: app.fetch,
  queue: queueHandler.queue,
  scheduled: scheduleHandler.scheduled
};
