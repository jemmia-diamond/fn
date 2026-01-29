import * as crypto from "crypto";

export default class LarkCipher {
  static async decryptEvent(env: any, encrypted: string): Promise<string> {
    const encryptKey = await env.JEMMIA_BOT_LARK_ENCRYPT_KEY_SECRET.get();
    if (!encryptKey) {
      throw new Error("JEMMIA_BOT_LARK_ENCRYPT_KEY is not set");
    }

    const key = crypto.createHash("sha256").update(encryptKey).digest();
    const iv = Buffer.from(encrypted, "base64").subarray(0, 16);
    const encryptedData = Buffer.from(encrypted, "base64").subarray(16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key as any, iv as any);
    let decrypted = decipher.update(encryptedData as any);
    decrypted = Buffer.concat([decrypted, decipher.final()] as any);

    return decrypted.toString("utf8");
  }
}
