const IPs = ["203.171.22.6"];

export const verifyPancakeWebhook = async (ctx, next) => {
  const headers = ctx.req.headers;
  X_REAL_IP = headers["x-real-ip"];
  if (!IPs.includes(X_REAL_IP)) {
    throw new HTTPException(400, "Bad request");
  }
  await next();
};
