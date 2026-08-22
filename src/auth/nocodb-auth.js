export const verifyNocoWebhook = async (ctx, next) => {
  const secret = ctx.env.NOCODB_WEBHOOK_SECRET;
  if (!secret) {
    return ctx.json({ error: "NocoDB Webhook Secret is not configured" }, 500);
  }

  const clientSecret = ctx.req.header("X-NocoDB-Webhook-Secret");
  if (!clientSecret || clientSecret !== secret) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
