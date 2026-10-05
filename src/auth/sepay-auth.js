import { createMiddleware } from "hono/factory";

export const verifySepayWebhook = createMiddleware(async (c, next) => {
  const secret = c.env.SEPAY_WEBHOOK_SECRET;
  if (!secret) {
    return c.json({ error: "SePay Webhook Secret is not configured" }, 500);
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized: Missing Authorization header" }, 401);
  }

  // SePay sends Authorization header as "Apikey YOUR_TOKEN" or sometimes just the raw token.
  // We extract the key and compare it.
  const token = authHeader.startsWith("Apikey ")
    ? authHeader.slice(7)
    : authHeader;

  if (token !== secret) {
    return c.json({ error: "Unauthorized: Invalid Authorization header" }, 401);
  }

  await next();
});
