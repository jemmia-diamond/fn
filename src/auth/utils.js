import { HmacSHA256 } from "crypto-js";
import Base64 from "crypto-js/enc-base64";

export const generateHmacBase64 = (plainText, secret) => {
    const computedHmac = Base64.stringify(HmacSHA256(plainText, secret));
    return computedHmac;
}