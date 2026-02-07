import { Context } from "hono";
import LarkCipher from "services/larksuite/lark-cipher";
import RecallLarkService from "services/larksuite/recall-lark-service";

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
        try {
          const imageBuffer = await RecallLarkService.downloadImage(
            c.env,
            payload.image_key
          );
          const base64 = imageBuffer.toString("base64");
          contentHtml = `<div style="padding: 20px; text-align: center;"><img src="data:image/png;base64,${base64}" style="max-width: 100%; height: auto; border-radius: 4px;" /></div>`;
        } catch {
          console.warn("Failed to render single image");
          contentHtml =
            "<div style=\"padding: 20px; text-align: center;\">[Image failed to load]</div>";
        }
      } else if (type === "post") {
        const payload = JSON.parse(decrypted);
        contentHtml = await RecallMessageViewController.renderPost(
          c.env,
          payload
        );
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
    } catch (e: any) {
      console.warn("RecallMessageView Error:", e);
      return c.text("Invalid or expired link", 400);
    }
  }

  private static async renderPost(env: any, payload: any): Promise<string> {
    const content = payload.content;
    let html = "<div style=\"font-family: sans-serif; padding: 20px;\">";

    if (content.title) {
      html += `<h2 style="margin-top: 0;">${content.title}</h2>`;
    }

    if (content.content) {
      for (const line of content.content) {
        html += "<p style=\"margin: 0.5em 0;\">";
        for (const item of line) {
          switch (item.tag) {
          case "text":
            html += this.escapeHtml(item.text);
            break;
          case "a":
            html += `<a href="${item.href}" target="_blank">${this.escapeHtml(item.text)}</a>`;
            break;
          case "at":
            html += `<span style="color: #3370ff;">@${this.escapeHtml(item.text)}</span>`;
            break;
          case "img":
            if (item.image_key) {
              try {
                const imageBuffer = await RecallLarkService.downloadImage(
                  env,
                  item.image_key
                );
                const base64 = imageBuffer.toString("base64");
                html += `<img src="data:image/png;base64,${base64}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 5px 0;" />`;
              } catch {
                console.warn("Failed to render image");
                html += "[Image failed to load]";
              }
            } else {
              html += `[Image: ${item.image_key}]`;
            }
            break;
          }
        }
        html += "</p>";
      }
    }

    html += "</div>";
    return html;
  }

  private static escapeHtml(text: string): string {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
