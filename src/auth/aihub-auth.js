import { HTTPException } from "hono/http-exception";

const verifyAIHubWebhook = async (ctx, next) => {
  const deliveryToken = ctx.req.header("X-AIHUB-Delivery");
  if (!deliveryToken) {
    throw new HTTPException(401, "Invalid access token");
  }

  let secret = ctx.env.AI_HUB_ACCESS_TOKEN;
  if (secret !== deliveryToken) {
    throw new HTTPException(401, "Invalid access token");
  }

  await next();
};

export default verifyAIHubWebhook;
