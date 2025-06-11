import { HTTPException } from "hono/http-exception";
import { encodeBase64 } from "hono/utils/encode";
import { HmacSHA256 } from "crypto-js";

const verifyFrappeWebhook = async (ctx, next) => {
  const signature = ctx.req.header("X-Frappe-Webhook-Signature");
  if (!signature) {
    throw new HTTPException(400, "Missing signature header");
  }

  const rawBody = await ctx.req.text();
  const computedHmac = encodeBase64(HmacSHA256(rawBody, ctx.env.FRAPPE_WEBHOOK_SECRET).toString());

  if (signature !== computedHmac) {
    throw new HTTPException(401, "Unauthorized");
  }
  await next();
};

export default verifyFrappeWebhook;
