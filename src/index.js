import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { logger } from "hono/logger";

import Routes from "./routes";
import errorTracker from "./services/error-tracker";

const app = new Hono();
const api = app.basePath("/api");

// Logging
app.use(logger());

// Error tracking
app.use("*", errorTracker);

// Authentication
api.use("*", bearerAuth({
  verifyToken: async (token, c) => {
    return token === c.env.BEARER_TOKEN;
  }
}));

// Routes registration
Routes.register(api);

export default app;
