import { HTTPException } from "hono/http-exception";

export const verifyPancakeWebhook = async (ctx, next) => {
  const xRealIP = ctx.req.header("x-real-ip");
  const pancakeAllowedIPs = ctx.env.PANCAKE_ALLOWED_IPS.split(",");
  if (!pancakeAllowedIPs.includes(xRealIP)) {
    throw new HTTPException(401, "Unauthorized");
  }
  await next();
};
