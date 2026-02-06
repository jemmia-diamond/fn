import * as crypto from "crypto";

export default class LarkCipher {
  static async decryptEvent(
    encrypted: string,
    cipherSecret: string
  ): Promise<string> {
    if (!cipherSecret) {
      throw new Error("Cipher secret is missing");
    }

    const key = crypto.createHash("sha256").update(cipherSecret).digest();
    const raw = Buffer.from(encrypted, "base64");
    if (raw.length <= 16) {
      throw new Error("Invalid encrypted payload length");
    }
    const iv = raw.subarray(0, 16);
    const encryptedData = raw.subarray(16);

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key as any,
      iv as any
    );
    let decrypted = decipher.update(encryptedData as any);
    decrypted = Buffer.concat([decrypted, decipher.final()] as any);

    return decrypted.toString("utf8");
  }
  static encrypt(data: string, cipherSecret: string): string {
    if (!cipherSecret) {
      throw new Error("Cipher secret is missing");
    }

    const key = crypto.createHash("sha256").update(cipherSecret).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key as any, iv as any);

    let encrypted = cipher.update(data, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()] as any);

    return Buffer.concat([iv, encrypted as any]).toString("base64");
  }
}
