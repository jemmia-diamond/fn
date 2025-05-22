import { Hono } from "hono";
import { sentry } from "@hono/sentry";

const app = new Hono();

// Add release and dist information for sourcemap matching
app.use("*", sentry({
  release: process.env.SENTRY_RELEASE || "1.0.0", // Should match the release name in your upload script
  dist: process.env.SENTRY_DIST || "1" // Optional distribution identifier
}));
app.get("/xxx", (_c) => {
  return c.text("Hello Hono!");
});
app.get("/yyy", (_c) => {
  return c.text("Hello Hono!");
});
app
app.get("/zzz", (_c) => {
  return c.text("Hello Hono!");
});
app.get("/sentry", (_c) => {
  randomError(0.33, "0.33 error");
  randomError(0.5, "0.5 error");

  return c.text("You're lucky!");
});

// Write a function that return error randomly
function randomError(rate, message) {
  if (Math.random() < rate) {
    throw new Error(message);
  }
}

export default app;
