import { timingSafeEqual } from "auth/utils";
import crypto from "crypto";
import { createMiddleware } from "hono/factory";

export const verifySepayWebhook = createMiddleware(async (c, next) => {
  const secret = c.env.SEPAY_WEBHOOK_SECRET;
  if (!secret) {
    return c.json({ error: "SePay Webhook Secret is not configured" }, 500);
  }

  const signatureHeader = c.req.header("X-SePay-Signature") || "";
  const timestamp = c.req.header("X-SePay-Timestamp");

  if (!signatureHeader || !timestamp) {
    return c.json({ error: "Missing signature or timestamp" }, 401);
  }

  const actualSignature = signatureHeader.replace("sha256=", "");

  const body = await c.req.text();
  const message = `${timestamp}.${body}`;

  // Calculate HMAC-SHA256 hex signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

  if (!timingSafeEqual(actualSignature, expectedSignature)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
