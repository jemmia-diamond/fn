/* eslint no-console: "off" */

import { createMiddleware } from "hono/factory";

class CustomLogger {
  createMiddleware() {
    return createMiddleware(async (c, next) => {
      const startTime = performance.now();
      const requestInfo = this.extractRequestInfo(c);
      const requestBody = await this.extractRequestBody(c);

      // Process the request
      await next();

      const duration = performance.now() - startTime;
      this.logRequest(requestInfo, requestBody, c.res?.status || 0, duration);
    });
  }

  extractRequestInfo(c) {
    const method = c.req.method;
    const path = new URL(c.req.url).pathname;

    return { method, path };
  }

  async extractRequestBody(c) {
    const method = c.req.method;
    if (method === "GET") return "";

    try {
      const clonedReq = c.req.raw.clone();
      const contentType = c.req.header("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = await clonedReq.json();
        return JSON.stringify(body);
      }
    } catch (e) {
      console.log("Error parsing request body:", e);
    };

    return "";
  }

  logRequest(requestInfo, requestBody, status, duration) {
    const { method, path } = requestInfo;

    const logParts = [
      `method=${method}`,
      `path=${path}`,
      `status=${status}`,
      `duration=${duration.toFixed(1)}ms`
    ];

    if (requestBody) {
      logParts.push(`payload=${requestBody}`);
    }

    console.log(logParts.join(" "));
  }
}

const loggerInstance = new CustomLogger();
export const loggrageLogger = () => loggerInstance.createMiddleware();
export default loggrageLogger;
