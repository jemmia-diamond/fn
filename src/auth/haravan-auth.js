import { HTTPException } from "hono/http-exception";
import { encodeBase64 } from "hono/utils/encode";

import { HmacSHA256 } from "crypto-js";

const verifyHaravanWebhook = async (ctx, next) => {
  const signature = ctx.req.header("X-Haravan-Hmac-Sha256");
  if (!signature) {
    throw new HTTPException(400, "Missing signature header");
  }

  const rawBody = await ctx.req.text();
  const computedHmac = encodeBase64(HmacSHA256(rawBody, ctx.env.HARAVAN_CLIENT_SECRET).toString());

  if (signature !== computedHmac) {
    throw new HTTPException(401, "Unauthorized");
  };
  await next();
};

export default verifyHaravanWebhook;
