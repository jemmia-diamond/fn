import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import JemmiaShieldNotificationService from "services/jemmia-shield/shield-notification-service";
import { JemmiaShieldUtils } from "services/jemmia-shield/utils/shield-utils";
import * as Sentry from "@sentry/cloudflare";

export default class JemmiaShieldMessageViewService {
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
    const payload = await JemmiaShieldUtils.decryptViewPayload(env, data);

    let contentHtml = "";
    try {
      await JemmiaShieldNotificationService.sendSensitiveViewNotification(
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
        <title>Loading...</title>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; flex-direction: column; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .debug-info { margin-top: 20px; font-size: 12px; color: #666; word-break: break-all; padding: 10px; max-width: 90%; }
        </style>
      </head>
      <body>
        <div id="loader" class="loader"></div>
        <div id="message" style="margin-top: 20px; display: none; text-align: center;"></div>
        <div id="debug" class="debug-info" style="display: none;"></div>
        <script>
          const appId = "${appId}";

          function showMetaInfo(msg) {
              const debugEl = document.getElementById("debug");
              debugEl.style.display = "block";
    
              let ttStatus = "undefined";
              let hasGetAuth = "no";
              let keys = "none";
    
              if (window.tt) {
                  ttStatus = "defined";
                  hasGetAuth = typeof window.tt.getAuthCode;
                  try { keys = Object.keys(window.tt).join(","); } catch(e) {}
              }

              debugEl.innerText = msg + "\\nUA: " + navigator.userAgent + "\\nTT: " + ttStatus + " | getAuthCode: " + hasGetAuth + "\\nKeys: " + keys;
          }

          function startAuth() {
            if (!window.tt) {
               document.getElementById("loader").style.display = "none";
               document.getElementById("message").style.display = "block";
               document.getElementById("message").innerText = "Lỗi: window.tt không tìm thấy.";
               showMetaInfo("window.tt missing");
               return;
            }

            const authFn = window.tt.getAuthCode || window.tt.requestAuthCode;

            if (authFn) {
               authFn.call(window.tt, {
                  appId: appId,
                  success: (res) => {
                     const currentUrl = new URL(window.location.href);
                     const code = res.code || res; 
                     currentUrl.searchParams.append("code", code);
                     window.location.replace(currentUrl.toString());
                  },
                  fail: (err) => {
                     document.getElementById("loader").style.display = "none";
                     document.getElementById("message").style.display = "block";
                     document.getElementById("message").innerText = "Lỗi xác thực (Auth Failed): " + JSON.stringify(err);
                     showMetaInfo("Auth Call Failed");
                  }
               });
            } else {
               document.getElementById("loader").style.display = "none";
               document.getElementById("message").style.display = "block";
               document.getElementById("message").innerText = "Lỗi: Không tìm thấy hàm getAuthCode hoặc requestAuthCode.";
               showMetaInfo("Missing function after load");
            }
          }

          function handleLoadError() {
             document.getElementById("loader").style.display = "none";
             document.getElementById("message").style.display = "block";
             document.getElementById("message").innerText = "Không thể tải Lark SDK (Network Error).";
             showMetaInfo("Script Load Error");
          }

          const script = document.createElement("script");
          script.src = "https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.23.js";
          script.onload = startAuth;
          script.onerror = handleLoadError;
          document.head.appendChild(script);

          setTimeout(() => {
             if (document.getElementById("loader").style.display !== "none") {
                if (window.tt && window.tt.getAuthCode) {
                   startAuth();
                }
             }
          }, 3000);
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
