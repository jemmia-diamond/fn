import { sentry } from "@hono/sentry";

export default async (c, next) => {
  // Process the request first
  await next();

  if (!is4xxError(c.res)) {
    const sentryMiddleware = sentry();
    await sentryMiddleware(c, async () => {});
  }
};

const is4xxError = (res) => {
  return res && res.status >= 400 && res.status < 500;
};
