import { Hono } from "hono";
import { sentry } from "@hono/sentry";

const app = new Hono();

app.use("*", sentry());
app.get("/sentry", (_c) => {
  throw new Error('test');
});

export default app;
