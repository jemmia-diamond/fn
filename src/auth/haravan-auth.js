import { HTTPException } from "hono/http-exception";
import { HmacSHA256 } from "crypto-js";
import { encodeBase64 } from "hono/utils/encode";

const verifyHaravanWebhook = async (ctx, next) => {
    const signature = ctx.req.header("X-Haravan-Hmac-Sha256");
    if (!signature) {
        throw new HTTPException(400, "Missing signature header");
    };

    const secret = ctx.env.HARAVAN_CLIENT_SECRET;
    if (!secret) {
        throw new HTTPException(500, "Internal server error");
    };

    const rawBody = await ctx.req.text();
    const computedHmac = encodeBase64(HmacSHA256(rawBody, secret).toString());

    if (signature !== computedHmac) {
        throw new HTTPException(400, "Invalid signature");
    };
    await next();
};

export default verifyHaravanWebhook;
