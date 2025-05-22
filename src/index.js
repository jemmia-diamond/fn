import { Hono } from "hono";
import { sentry } from "@hono/sentry";

const app = new Hono();

app.use("*", sentry());
app.get("/sentry", (_c) => {
  throw new Error("Sentry test");
});

export default app;
