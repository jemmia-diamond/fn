import { HTTPException } from "hono/http-exception";

export const verifyPancakeWebhook = async (ctx, next) => {
  const headers = ctx.req.headers;
  const pancakeAllowedIPs = ctx.env.PANCAKE_ALLOWED_IPS.split(",");
  const xRealIP = headers["x-real-ip"];
  if (!pancakeAllowedIPs.includes(xRealIP)) {
    throw new HTTPException(401, "Unauthorized");
  }
  await next();
};
