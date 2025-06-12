import { createMiddleware } from "hono/factory";
import { generateHmacBase64 } from "./utils";
import { HTTPException } from "hono/http-exception";

export const verifyHmacBase64Auth = (signatureheaderkey, secretEnvKey) =>
  createMiddleware(async (c, next) => {
    const secret = c.env[secretEnvKey];
    const signature = c.req.header(signatureheaderkey);
    if (!signature) {
      throw new HTTPException(400, "Bad request");
    }
    const body = await c.req.text();
    const computedHmac = generateHmacBase64(body, secret);
    if (signature !== computedHmac) {
      throw new HTTPException(401, "Unauthorized");
    }
    await next();
  });