import { createMiddleware } from "hono/factory";
import CryptoJS from "crypto-js";
const { HmacSHA256, enc } = CryptoJS;
const Hex = enc.Hex;

/**
 * Performs a timing-safe comparison of two strings.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const verifyInfisicalAuth = (signatureHeaderKey, secretEnvKey) =>
  createMiddleware(async (c, next) => {
    const signatureHeader = c.req.header(signatureHeaderKey);

    if (!signatureHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const parts = signatureHeader.split(";");
    if (parts.length !== 2 || !parts[0].startsWith("t=")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const receivedSignature = parts[1].trim().toLowerCase();

    if (!/^[a-f0-9]{64}$/i.test(receivedSignature)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const secret = c.env?.[secretEnvKey];

    if (!secret) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.text();

    const computedHmac = HmacSHA256(body, secret).toString(Hex).toLowerCase();

    if (!timingSafeEqual(computedHmac, receivedSignature)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  });
