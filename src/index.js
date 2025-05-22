import { Hono } from "hono";
import { sentry } from "@hono/sentry";

const app = new Hono();

app.use("*", sentry());

export default app;
