import { HmacSHA256 } from "crypto-js";
import Base64 from "crypto-js/enc-base64";

export const generateHmacBase64 = (plainText, secret) => {
  const computedHmac = Base64.stringify(HmacSHA256(plainText, secret));
  return computedHmac;
};

export const timingSafeEqual = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};
