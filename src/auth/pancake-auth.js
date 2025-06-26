import { HTTPException } from "hono/http-exception";

export const verifyPancakeWebhook = async (ctx, next) => {
  const headers = ctx.req.headers;
  const PANCAKE_ALLOWED_IPS = ctx.env.PANCAKE_ALLOWED_IPS ? ctx.env.PANCAKE_ALLOWED_IPS.split(",") : ["203.171.22.6"];
  const X_REAL_IP = headers["x-real-ip"];
  if (!PANCAKE_ALLOWED_IPS.includes(X_REAL_IP)) {
    throw new HTTPException(401, "Unauthorized");
  }
  await next();
};
