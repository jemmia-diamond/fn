/* eslint no-console: "off" */

import { createMiddleware } from "hono/factory";

class CustomLogger {
  createMiddleware(trackObject) {
    return createMiddleware(async (c, next) => {
      const startTime = performance.now();
      const requestInfo = this.extractRequestInfo(c);
      const requestBody = await this.extractRequestBody(c);

      // Process the request
      await next();

      const duration = performance.now() - startTime;
      await this.logRequest(requestInfo, requestBody, c.res?.status || 0, duration, trackObject);
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

  async logRequest(requestInfo, requestBody, status, duration, trackObject) {
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

    // Send custom logs
    try {
      if (trackObject && trackObject.logger) {
        // Log different severity levels based on status code
        if (status >= 500) {
          trackObject.logger.error("server error", { "log.file.name": "error.log", method, path, status, duration });
        } else if (status >= 400) {
          trackObject.logger.warn("client error", { "log.file.name": "warn.log", method, path, status, duration });
        } else if (status >= 200 && status < 300) {
          trackObject.logger.info("success", { method, path, status, duration });
        } else {
          trackObject.logger.debug("request", { method, path, status, duration });
        }
      }
    } catch (e) {
      // Fallback to console if middleware tracking fails
      console.log("Custom tracking error:", e);
    }
  }
}

const loggerInstance = new CustomLogger();
export const loggrageLogger = (trackObject = null) => loggerInstance.createMiddleware(trackObject);
export default loggrageLogger;
