import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import ShieldNotificationService from "services/jemmia-shield/shield-notification-service";
import { ShieldUtils } from "services/jemmia-shield/utils/shield-utils";
import * as Sentry from "@sentry/cloudflare";

export default class ShieldMessageViewService {
  static async processAndRenderMessage(
    env: any,
    data: string,
    code: string | undefined,
    type: string
  ): Promise<string> {
    if (!code) {
      return this.renderLoadingPage(env.LARK_APP_SHIELD_ID);
    }

    // Decryption might throw, caller should handle 400 error
    const payload = await ShieldUtils.decryptViewPayload(env, data);

    let contentHtml = "";
    try {
      await ShieldNotificationService.sendSensitiveViewNotification(
        env,
        code,
        payload,
        type
      );

      const renderContent = this.prepareRenderContent(payload);

      if (type === "image") {
        contentHtml = await this.renderImage(env, renderContent);
      } else if (type === "post") {
        contentHtml = await this.renderPost(env, renderContent);
      } else {
        contentHtml = this.renderText(renderContent);
      }
    } catch (error: any) {
      Sentry.captureException(error);
      contentHtml = `<div style="color: red; padding: 10px; background: #ffe6e6; border: 1px solid red; margin-bottom: 10px;">Debug Error: ${error.message}</div>`;
    }

    return this.renderContentPage(contentHtml);
  }

  private static prepareRenderContent(payload: any): any {
    let renderContent = payload;
    if (payload.original) {
      renderContent = payload.original;
      if (
        typeof renderContent === "object" &&
        renderContent !== null &&
        payload.thread_id &&
        !renderContent.thread_id
      ) {
        renderContent.thread_id = payload.thread_id;
      }
    }
    return renderContent;
  }

  static renderLoadingPage(appId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Đang xác thực...</title>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: -apple-system, sans-serif; flex-direction: column; background: #f5f6f7; color: #1f2329; }
          .loader { border: 3px solid #dee0e3; border-top: 3px solid #3370ff; border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .status { margin-top: 20px; font-size: 14px; color: #646a73; }
          #debug { margin-top: 20px; font-size: 11px; color: #999; display: none; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #eee; max-width: 80%; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <div class="status">Đang kết nối danh tính Lark...</div>
        <div id="debug"></div>

        <script src="https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.23.js"></script>
        <script>
          const appId = "${appId}";
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds

          const checkTimer = setInterval(() => {
            attempts++;
            const tt = window.tt;
            const authFn = tt ? (tt.getAuthCode || tt.requestAuthCode) : null;

            if (authFn) {
              clearInterval(checkTimer);
              authFn.call(tt, {
                appId: appId,
                success: (res) => {
                  const url = new URL(window.location.href);
                  url.searchParams.append("code", res.code || res);
                  window.location.replace(url.toString());
                },
                fail: (err) => {
                  document.querySelector('.status').innerHTML = '<span style="color: #d32f2f">Xác thực thất bại</span>';
                  const debugEl = document.getElementById('debug');
                  debugEl.style.display = 'block';
                  debugEl.innerText = "Lỗi Lark: " + JSON.stringify(err);
                }
              });
            } else if (attempts >= maxAttempts) {
              clearInterval(checkTimer);
              document.querySelector('.status').innerHTML = '<span style="color: #d32f2f">Lỗi: Không tìm thấy trình điều khiển Lark</span>';
              const debugEl = document.getElementById('debug');
              debugEl.style.display = 'block';
              debugEl.innerText = "Môi trường: " + (window.tt ? "Có tt nhưng thiếu hàm Auth" : "Thiếu tt") + "\\nUA: " + navigator.userAgent;
            }
          }, 100);
        </script>
      </body>
      </html>
    `;
  }

  static renderContentPage(contentHtml: string): string {
    return `
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
    `;
  }

  static async renderImage(env: any, renderContent: any): Promise<string> {
    try {
      const imageKey =
        renderContent.image_key ||
        (typeof renderContent === "string" ? renderContent : null);
      if (imageKey) {
        const imageBuffer = await JemmiaShieldLarkService.downloadImage(
          env,
          imageKey
        );
        const base64 = imageBuffer.toString("base64");
        return `<div style="padding: 20px; text-align: center;"><img src="data:image/png;base64,${base64}" style="max-width: 100%; height: auto; border-radius: 4px;" /></div>`;
      } else {
        return "<div style=\"padding: 20px; text-align: center;\">[Image key missing]</div>";
      }
    } catch (error) {
      Sentry.captureException(error);
      return "<div style=\"padding: 20px; text-align: center;\">[Image failed to load]</div>";
    }
  }

  static renderText(renderContent: any): string {
    const textContent =
      renderContent.text ||
      (typeof renderContent === "string"
        ? renderContent
        : JSON.stringify(renderContent, null, 2));
    return `<div style="white-space: pre-wrap; word-break: break-word; font-family: sans-serif; padding: 20px;">${this.formatText(
      this.escapeHtml(textContent)
    )}</div>`;
  }

  static async renderPost(env: any, payload: any): Promise<string> {
    const content = payload;
    let html = "<div style=\"font-family: sans-serif; padding: 20px;\">";

    if (content.title) {
      html += `<h2 style="margin-top: 0;">${content.title}</h2>`;
    }

    if (content.content) {
      for (const line of content.content) {
        html += "<p style=\"margin: 0.5em 0;\">";
        for (const item of line) {
          switch (item.tag) {
          case "text": {
            let text = this.escapeHtml(item.text);
            if (item.style) {
              if (item.style.includes("bold"))
                text = `<strong>${text}</strong>`;
              if (item.style.includes("italic")) text = `<em>${text}</em>`;
              if (item.style.includes("strikethrough"))
                text = `<del>${text}</del>`;
              if (item.style.includes("underline")) text = `<u>${text}</u>`;
            }
            text = this.formatText(text);
            html += text;
            break;
          }
          case "a":
            html += `<a href="${item.href}" target="_blank">${this.escapeHtml(
              item.text
            )}</a>`;
            break;
          case "at": {
            const displayText = item.text || item.user_id || "Unknown";
            html += `<span style="color: #3370ff;">@${this.escapeHtml(
              displayText
            )}</span>`;
            break;
          }
          case "img":
            if (item.image_key) {
              try {
                const imageBuffer =
                    await JemmiaShieldLarkService.downloadImage(
                      env,
                      item.image_key
                    );
                const base64 = imageBuffer.toString("base64");
                html += `<img src="data:image/png;base64,${base64}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 5px 0;" />`;
              } catch (error) {
                Sentry.captureException(error);
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

  private static formatText(text: string): string {
    text = text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
      const match = url.match(/^([^\s]+?)([.,;!?]+)$/);
      if (match) {
        return `<a href="${match[1]}" target="_blank">${match[1]}</a>${match[2]}`;
      }
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
    text = text.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
      (email) => `<a href="mailto:${email}">${email}</a>`
    );
    text = text.replace(
      /(@[^\s]+)/g,
      (mention) => `<span style="color: #3370ff;">${mention}</span>`
    );
    return text;
  }
}
