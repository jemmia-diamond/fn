import { Context } from "hono";
import LarkCipher from "services/larksuite/lark-cipher";
import RecallLarkService from "services/larksuite/recall-lark-service";
import { MESSAGE_TYPE } from "services/larksuite/recall-message-service";

export default class RecallMessageViewController {
  static async show(c: Context) {
    try {
      const data = c.req.query("data");
      const type = c.req.query("type") || "text";
      const code = c.req.query("code");

      if (!data) {
        return c.text("Missing data", 400);
      }

      let contentHtml = "";

      const env = c.env;
      const encryptKey = await env.LARK_SHIELD_ENCRYPT_KEY_SECRET.get();
      const decrypted = await LarkCipher.decryptEvent(data, encryptKey);
      const payload = JSON.parse(decrypted);

      // Handle new payload structure { original, masked }
      // We want to show the ORIGINAL content to the user here
      let renderContent = payload;
      if (payload.original) {
        renderContent = payload.original;
        // Ensure thread_id is available on renderContent if it was on payload
        // Only if renderContent is an object (post/image/etc), not string (text)
        if (
          typeof renderContent === "object" &&
          renderContent !== null &&
          payload.thread_id &&
          !renderContent.thread_id
        ) {
          renderContent.thread_id = payload.thread_id;
        }
      }

      // Scenario 1: Logic with Auth Code (User identified)
      if (code) {
        try {
          const userToken = await RecallLarkService.getUserAccessToken(
            env,
            code
          );
          const userInfo = await RecallLarkService.getUserInfo(
            env,
            userToken.access_token
          );

          const openId = userToken.open_id || userInfo.open_id;

          if (payload.thread_id) {
            const time = new Date().toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh"
            });
            // const viewUrl = c.req.url.split("&code=")[0]; // Clean URL for the link in notification

            // Generate link for MASKED content
            let maskedContent = payload.masked;
            // Fallback for old payloads or if structure doesn't match
            if (!maskedContent && !payload.original) {
              maskedContent = payload;
            }

            let maskedPayload = maskedContent;
            if (typeof maskedContent === "string") {
              if (type === "text") {
                maskedPayload = { text: maskedContent };
              } else if (type === "image") {
                maskedPayload = { image_key: maskedContent };
              }
            }
            // Ensure maskedPayload is an object to add the flag
            if (typeof maskedPayload === "object" && maskedPayload !== null) {
              maskedPayload.is_masked = true;
              // Also ensure thread_id is passed if not present (though generateViewMessageUrl handles it,
              // passing it in payload ensures it persists if generateViewMessageUrl logic changes slightly or for clarity)
              if (!maskedPayload.thread_id && payload.thread_id) {
                maskedPayload.thread_id = payload.thread_id;
              }
            }

            const maskedViewLink =
              await RecallLarkService.generateViewMessageUrl(
                env,
                maskedPayload, // Pass the object with is_masked flag
                type,
                payload.thread_id
              );

            const cardContent = {
              config: {
                wide_screen_mode: true
              },
              elements: [
                {
                  tag: "div",
                  text: {
                    tag: "lark_md",
                    content: `<at id="${openId}"></at> đã xem tin nhắn vào lúc ${time}`
                  }
                },
                {
                  tag: "action",
                  actions: [
                    {
                      tag: "button",
                      text: {
                        tag: "plain_text",
                        content: "Xem tin nhắn"
                      },
                      type: "default",
                      url: maskedViewLink
                    }
                  ]
                }
              ]
            };

            // Send notification to thread ONLY if not already masked view
            if (!payload.is_masked) {
              await RecallLarkService.sendMessageToThread(
                env,
                payload.thread_id,
                MESSAGE_TYPE.INTERACTIVE,
                JSON.stringify(cardContent)
              );
            }
          }
        } catch (error: any) {
          console.warn(
            "Failed to process auth code or send notification:",
            error
          );
          // Append error to contentHtml (or a separate variable) to see it in browser
          contentHtml += `<div style="color: red; padding: 10px; background: #ffe6e6; border: 1px solid red; margin-bottom: 10px;">Debug Error: ${error.message}</div>`;
        }
      }
      // Scenario 2: No Auth Code - Attempt Silent Auth via H5 SDK
      else {
        const appId = env.LARK_APP_SHIELD_ID;
        return c.html(`
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
                console.log("SDK Loaded, starting auth...");
      
                if (!window.tt) {
                   document.getElementById("loader").style.display = "none";
                   document.getElementById("message").style.display = "block";
                   document.getElementById("message").innerText = "Lỗi: window.tt không tìm thấy.";
                   showMetaInfo("window.tt missing");
                   return;
                }

                // Try getAuthCode, fallback to requestAuthCode
                const authFn = window.tt.getAuthCode || window.tt.requestAuthCode;

                if (authFn) {
                   // Bind to window.tt to be safe
                   authFn.call(window.tt, {
                      appId: appId,
                      success: (res) => {
                         const currentUrl = new URL(window.location.href);
                         // requestAuthCode might return res.code or just res as string in some versions, 
                         // but usually object with code.
                         const code = res.code || res; 
                         currentUrl.searchParams.append("code", code);
                         window.location.replace(currentUrl.toString());
                      },
                      fail: (err) => {
                         console.error("Auth failed", err);
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

              // Create script tag programmatically to handle events properly
              const script = document.createElement("script");
              script.src = "https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.23.js";
              script.onload = startAuth;
              script.onerror = handleLoadError;
              document.head.appendChild(script);

              // Fallback timeout
              setTimeout(() => {
                 if (document.getElementById("loader").style.display !== "none") {
                    console.warn("Timeout waiting for SDK");
                    // DO NOT hide loader yet, maybe just slow. But log it.
                    // If window.tt appeared by magic, try using it?
                    if (window.tt && window.tt.getAuthCode) {
                       startAuth();
                    }
                 }
              }, 3000);
            </script>
          </body>
          </html>
        `);
      }

      // Render Content (Same logic as before, but payload is already parsed)
      // contentHtml is already declared at the top

      if (type === "image") {
        try {
          // Payload might have image_key directly or nested, checking logic
          const imageKey =
            renderContent.image_key ||
            (typeof renderContent === "string" ? renderContent : null);
          if (imageKey) {
            const imageBuffer = await RecallLarkService.downloadImage(
              c.env,
              imageKey
            );
            const base64 = imageBuffer.toString("base64");
            contentHtml = `<div style="padding: 20px; text-align: center;"><img src="data:image/png;base64,${base64}" style="max-width: 100%; height: auto; border-radius: 4px;" /></div>`;
          } else {
            contentHtml =
              "<div style=\"padding: 20px; text-align: center;\">[Image key missing]</div>";
          }
        } catch {
          console.warn("Failed to render single image");
          contentHtml =
            "<div style=\"padding: 20px; text-align: center;\">[Image failed to load]</div>";
        }
      } else if (type === "post") {
        contentHtml = await RecallMessageViewController.renderPost(
          c.env,
          renderContent
        );
      } else {
        const textContent =
          renderContent.text ||
          (typeof renderContent === "string"
            ? renderContent
            : JSON.stringify(renderContent, null, 2));
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
      return c.text("Invalid or expired link: " + e.message, 400);
    }
  }

  private static async renderPost(env: any, payload: any): Promise<string> {
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
