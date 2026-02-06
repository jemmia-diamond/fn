import { Context } from "hono";
import LarkCipher from "services/larksuite/lark-cipher";

export default class RecallMessageViewController {
  static async show(c: Context) {
    try {
      const data = c.req.query("data");
      const type = c.req.query("type") || "text";

      if (!data) {
        return c.text("Missing data", 400);
      }

      const encryptKey = await c.env.LARK_SHIELD_ENCRYPT_KEY_SECRET.get();
      const decrypted = await LarkCipher.decryptEvent(data, encryptKey);

      let contentHtml = "";

      if (type === "image") {
        const payload = JSON.parse(decrypted);
        contentHtml = `<div style="padding: 20px; text-align: center;">Image Key: ${payload.image_key} (Cannot render protected image in webview easily without proxy)</div>`;
      } else {
        const payload = JSON.parse(decrypted);
        const textContent = payload.text || JSON.stringify(payload, null, 2);
        contentHtml = `<div style="white-space: pre-wrap; word-break: break-word; font-family: sans-serif; padding: 20px;">${textContent}</div>`;
      }

      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Sensitive Message</title>
          <style>
            body { margin: 0; padding: 0; background: #f5f6f7; display: flex; justify-content: center; min-height: 100vh; }
            .container { background: white; width: 100%; max-width: 600px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 100vh; }
          </style>
        </head>
        <body>
          <div class="container">
             ${contentHtml}
          </div>
        </body>
        </html>
      `);
    } catch {
      return c.text("Invalid or expired link", 400);
    }
  }
}
