import { createMiddleware } from "hono/factory";
import { timingSafeEqual } from "auth/utils";

export const verifyStaticTokenAuth = (headerKey, secretEnvKey) =>
  createMiddleware(async (c, next) => {
    const secret = c.env[secretEnvKey];
    const clientToken = c.req.header(headerKey);

    if (!secret || !clientToken || !timingSafeEqual(clientToken, secret)) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  });
