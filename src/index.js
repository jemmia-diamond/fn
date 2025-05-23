import { Hono } from "hono";
import { sentry } from "@hono/sentry";

import Routes from "./routes";

const app = new Hono();
const api = app.basePath("/api");

// For error tracking
app.use("*", sentry());

// Register routes
Routes.register(api);

export default app;
