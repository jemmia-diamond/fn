import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { some } from "hono/combine";
import verifyHaravanWebhook from "./auth/haravan-auth";
import Routes from "./routes";
import errorTracker from "./services/error-tracker";
import scheduleHandler from "./schedules/schedule-handler";
import queueHandler from "./queues/queue-handler";

const app = new Hono();
const api = app.basePath("/api");

// Error tracking
app.use("*", errorTracker);

// Authentication
api.use("*",
    // Need one of the auth middlewares passed
    some(
        bearerAuth({
            verifyToken: async (token, c) => {
                return token === c.env.BEARER_TOKEN;
            }
        }),
        verifyHaravanWebhook
    )
);

// Routes registration
Routes.register(api);

// Cron trigger and Queue Integrations
export default {
    fetch: app.fetch,
    scheduled: scheduleHandler.scheduled,
    queue: queueHandler.queue
}
