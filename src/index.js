import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { sentry } from "@hono/sentry";

import Routes from "./routes";

const app = new Hono();
const api = app.basePath("/api");

// Error tracking
app.use("*", sentry());

// Authentication
api.use("*", bearerAuth({
  verifyToken: async (token, c) => {
    return token === c.env.BEARER_TOKEN;
  }
}));

// Register routes
Routes.register(api);

export default app;
