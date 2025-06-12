import { HTTPException } from "hono/http-exception";
import { generateHmacBase64 } from "./utils";

const verifyHaravanWebhook = async (ctx, next) => {
  const signature = ctx.req.header("X-Haravan-Hmac-Sha256");
  if (!signature) {
    throw new HTTPException(400, "Missing signature header");
  }

  const rawBody = await ctx.req.text();
  const secret = ctx.env.HARAVAN_WEBHOOK_SECRET;
  const computedHmac = generateHmacBase64(rawBody, secret);

  if (signature !== computedHmac) {
    throw new HTTPException(401, "Unauthorized");
  };
  await next();
};

export default verifyHaravanWebhook;
