import { HTTPException } from "hono/http-exception";
import { generateHmacBase64 } from "./utils";

const verifyFrappeWebhook = async (ctx, next) => {
  const signature = ctx.req.header("X-Frappe-Webhook-Signature");
  if (!signature) {
    throw new HTTPException(400, "Missing signature header");
  }
  const rawBody = await ctx.req.text();
  const secret = ctx.env.FRAPPE_WEBHOOK_SECRET;
  const computedHmac = generateHmacBase64(rawBody, secret);
  if (signature !== computedHmac) {
    throw new HTTPException(401, "Unauthorized");
  }
  await next();
};

export default verifyFrappeWebhook;
