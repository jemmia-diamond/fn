import { HTTPException } from "hono/http-exception";
import { HmacSHA256 } from "crypto-js";
import Base64 from "crypto-js/enc-base64";

const verifyFrappeWebhook = async (ctx, next) => {
  const signature = ctx.req.header("X-Frappe-Webhook-Signature");
  if (!signature) {
    throw new HTTPException(400, "Missing signature header");
  }
  const rawBody = await ctx.req.text();
  const secret = ctx.env.FRAPPE_WEBHOOK_SECRET;
  const computedHmac = Base64.stringify(HmacSHA256(rawBody, secret));
  if (signature !== computedHmac) {
    throw new HTTPException(401, "Unauthorized");
  }
  await next();
};

export default verifyFrappeWebhook;
