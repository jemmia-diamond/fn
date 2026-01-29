import * as crypto from "crypto";

export default class LarkCipher {
  static async decryptEvent(encrypted: string, cipherSecret: string): Promise<string> {
    if (!cipherSecret) {
      throw new Error("Cipher secret is missing");
    }

    const key = crypto.createHash("sha256").update(cipherSecret).digest();
    const iv = Buffer.from(encrypted, "base64").subarray(0, 16);
    const encryptedData = Buffer.from(encrypted, "base64").subarray(16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key as any, iv as any);
    let decrypted = decipher.update(encryptedData as any);
    decrypted = Buffer.concat([decrypted, decipher.final()] as any);

    return decrypted.toString("utf8");
  }
}
