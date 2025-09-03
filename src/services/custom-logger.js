/* eslint no-console: "off" */

import { createMiddleware } from "hono/factory";
import { track } from "@middleware.io/agent-apm-worker";

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

    const logMessage = logParts.join(" ");
    console.log(logMessage);

    // Send custom logs to middleware.io APM
    try {
      // Log different severity levels based on status code
      if (status >= 500) {
        track.logger.error("server error", { "log.file.name": "error.log", method, path, status, duration });
      } else if (status >= 400) {
        track.logger.warn("client error", { "log.file.name": "warn.log", method, path, status, duration });
      } else if (status >= 200 && status < 300) {
        track.logger.info("success", { method, path, status, duration });
      } else {
        track.logger.debug("request", { method, path, status, duration });
      }
    } catch (e) {
      // Fallback to console if middleware tracking fails
      console.log("Middleware tracking error:", e);
    }
  }
}

const loggerInstance = new CustomLogger();
export const loggrageLogger = () => loggerInstance.createMiddleware();
export default loggrageLogger;
