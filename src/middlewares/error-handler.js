import * as Sentry from "@sentry/cloudflare";
import { HTTPException } from "hono/http-exception";

export default async (c, next) => {
  try {
    await next();

    // Don't send 404 responses to Sentry
    if (c.res.status === 404) { return; }
    if (c.res.status === 422) { return; }
  } catch (error) {
    // If it's already an HTTPException, let it bubble up
    if (error instanceof HTTPException) {
      throw error;
    }

    Sentry.captureException(error, {
      fingerprint: [error.name || "Error", error.message || "Unknown error"]
    });

    // Return generic 500 error to client
    return c.json({ error: "Internal server error" }, 500);
  }
};
