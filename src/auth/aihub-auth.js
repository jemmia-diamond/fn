const verifyAIHubWebhook = async (ctx, next) => {
  const deliveryToken = ctx.req.header("X-AIHUB-Delivery");
  if (!deliveryToken) return ctx.json({ error: "Invalid access token" }, 401);

  const bearerToken = await ctx.env.BEARER_TOKEN_SECRET.get();
  if ((deliveryToken !== bearerToken) && (deliveryToken !== ctx.env.BEARER_TOKEN)) {
    return ctx.json({ error: "Invalid access token" }, 401);
  }

  await next();
};

export default verifyAIHubWebhook;
