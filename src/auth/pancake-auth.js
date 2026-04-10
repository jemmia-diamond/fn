
export const verifyPancakeWebhook = async (ctx, next) => {
  const xRealIP = ctx.req.header("x-real-ip");
  const pancakeAllowedIPs = ctx.env.PANCAKE_ALLOWED_IPS.split(",");
  if (!pancakeAllowedIPs.includes(xRealIP)) return ctx.json({ error: "Unauthorized" }, 401);

  await next();
};
