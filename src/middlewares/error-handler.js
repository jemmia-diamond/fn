import * as Sentry from "@sentry/cloudflare";
import { HTTPException } from "hono/http-exception";

export default async (c, next) => {
  try {
    await next();
  } catch (error) {
    // If it's already an HTTPException, let it bubble up
    if (error instanceof HTTPException) {
      throw error;
    }

    // Log the error with context
    Sentry.captureException(error);

    // Return generic 500 error to client
    throw new HTTPException(500, "Internal server error");
  }
};
