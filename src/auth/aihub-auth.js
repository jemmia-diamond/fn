import { HTTPException } from "hono/http-exception";

const verifyAIHubWebhook = async (ctx, next) => {
  const deliveryToken = ctx.req.header("X-AIHUB-Delivery");
  if (!deliveryToken) {
    throw new HTTPException(401, "Invalid access token");
  }

  const bearerToken = await ctx.env.BEARER_TOKEN_SECRET.get();
  if ((deliveryToken !== bearerToken) && (deliveryToken !== c.env.BEARER_TOKEN)) {
    throw new HTTPException(401, "Invalid access token");
  }

  await next();
};

export default verifyAIHubWebhook;
