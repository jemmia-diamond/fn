import { createMiddleware } from "hono/factory";
import { generateHmacBase64 } from "auth/utils";

export const verifyHmacBase64Auth = (signatureheaderkey, secretEnvKey) =>
  createMiddleware(async (c, next) => {
    const secret = c.env[secretEnvKey];
    const signature = c.req.header(signatureheaderkey);
    if (!signature) return c.json({ error: "Bad reqeust" }, 400);

    const body = await c.req.text();
    const computedHmac = generateHmacBase64(body, secret);
    if (signature !== computedHmac) return c.json({ error: "Unauthorized" }, 401);

    await next();
  });
