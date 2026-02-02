import RecallLarkService from "services/larksuite/recall-lark-service";
import * as Sentry from "@sentry/cloudflare";
import PresidioClient from "services/clients/presidio-client";

const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  POST: "post"
} as const;

const CONTENT_TAG = {
  TEXT: "text",
  IMG: "img"
} as const;

export default class RecallMessageService {
  static async detectSensitiveInfoAndMask(env: any, event: any) {
    const content = JSON.parse(event.message.content);
    let text = "";

    if (event.message.message_type === MESSAGE_TYPE.TEXT) {
      text = content.text;

      if (await this.detectSensitiveInfo(env, text)) {
        // await RecallLarkService.recallMessage(env, event.message.message_id);

        const senderId = event.sender.sender_id.open_id;
        let responseText = "";

        const maskedText = await this.maskSensitiveInfo(env, text);
        responseText = `<at user_id="${senderId}"></at>: ${maskedText}`;

        const maskedContent = JSON.stringify({
          text: responseText
        });

        await RecallLarkService.sendMessageToThread(
          env,
          event.message.root_id ?? event.message.message_id,
          MESSAGE_TYPE.TEXT,
          maskedContent
        );

        await RecallLarkService.recallMessage(
          env,
          event.message.root_id ?? event.message.message_id
        );
      }
    } else if (event.message.message_type === MESSAGE_TYPE.IMAGE) {
      try {
        await RecallLarkService.sendMessageToThread(
          env,
          event.message.root_id ?? event.message.message_id,
          MESSAGE_TYPE.TEXT,
          JSON.stringify({
            text: "Phát hiện dữ liệu nhạy cảm trong hình ảnh. Xin vui lòng đợi..."
          })
        );

        const imageKey = content.image_key;
        const imageBuffer = await RecallLarkService.getImage(
          env,
          event.message.message_id,
          imageKey
        );

        await RecallLarkService.recallMessage(
          env,
          event.message.root_id ?? event.message.message_id
        );

        // Check for sensitive info in image
        const presidioClient = new PresidioClient(env);
        const anonymizeResult =
          await presidioClient.anonymizeImage(imageBuffer);

        // Upload anonymized image
        const base64Data = anonymizeResult.image.split(",")[1];
        const anonymizedBuffer = Buffer.from(base64Data, "base64");
        const newImageKey = await RecallLarkService.uploadImage(
          env,
          anonymizedBuffer
        );

        // Recall original message
        // await RecallLarkService.recallMessage(env, event.message.message_id);

        // 2. Send anonymized image
        const imageContent = JSON.stringify({ image_key: newImageKey });
        await RecallLarkService.sendMessageToThread(
          env,
          event.message.root_id ?? event.message.message_id,
          MESSAGE_TYPE.IMAGE,
          imageContent
        );

        await RecallLarkService.recallMessage(
          env,
          event.message.root_id ?? event.message.message_id
        );
        return;
      } catch (error) {
        Sentry.captureException(error);
        return;
      }
    } else if (event.message.message_type === MESSAGE_TYPE.POST) {
      try {
        const content = JSON.parse(event.message.content);

        await RecallLarkService.sendMessageToThread(
          env,
          event.message.root_id ?? event.message.message_id,
          MESSAGE_TYPE.TEXT,
          JSON.stringify({
            text: "Tin nhắn đang được kiểm tra, vui lòng đợi..."
          })
        );

        let hasImages = false;
        if (content.content) {
          for (const line of content.content) {
            for (const item of line) {
              if (item.tag === CONTENT_TAG.IMG) {
                hasImages = true;
                break;
              }
            }
            if (hasImages) break;
          }
        }

        if (hasImages) {
          const senderId = event.sender.sender_id.open_id;
          const imageMap = new Map<string, Buffer>();

          for (const line of content.content) {
            for (const item of line) {
              if (item.tag === CONTENT_TAG.IMG) {
                try {
                  const buffer = await RecallLarkService.getImage(
                    env,
                    event.message.message_id,
                    item.image_key
                  );
                  imageMap.set(item.image_key, buffer);
                } catch (error) {
                  Sentry.captureException(error);
                }
              }
            }
          }

          await RecallLarkService.recallMessage(
            env,
            event.message.root_id ?? event.message.message_id
          );

          if (content.title) {
            content.title = await this.maskSensitiveInfo(env, content.title);
          }

          const presidioClient = new PresidioClient(env);

          for (const line of content.content) {
            for (const item of line) {
              if (item.tag === CONTENT_TAG.TEXT) {
                item.text = await this.maskSensitiveInfo(env, item.text);
              } else if (item.tag === CONTENT_TAG.IMG) {
                const buffer = imageMap.get(item.image_key);
                if (buffer) {
                  const result = await presidioClient.anonymizeImage(buffer);
                  let bufferToUpload = buffer;
                  if (result.has_sensitive_info) {
                    const base64Data = result.image.split(",")[1];
                    bufferToUpload = Buffer.from(base64Data, "base64");
                  }
                  const newKey = await RecallLarkService.uploadImage(
                    env,
                    bufferToUpload
                  );
                  item.image_key = newKey;
                }
              }
            }
          }

          content.content.unshift([{ tag: "at", user_id: senderId }]);

          const postMessageContent = JSON.stringify({
            zh_cn: content
          });

          await RecallLarkService.sendMessageToThread(
            env,
            event.message.root_id ?? event.message.message_id,
            MESSAGE_TYPE.POST,
            postMessageContent
          );
        } else {
          let text = "";
          if (content.title) {
            text += content.title + " ";
          }
          for (const line of content.content) {
            for (const item of line) {
              if (item.tag === CONTENT_TAG.TEXT) {
                text += item.text + " ";
              }
            }
          }

          if (text && (await this.detectSensitiveInfo(env, text))) {
            const senderId = event.sender.sender_id.open_id;

            if (content.title) {
              content.title = await this.maskSensitiveInfo(env, content.title);
            }

            for (const line of content.content) {
              for (const item of line) {
                if (item.tag === CONTENT_TAG.TEXT) {
                  item.text = await this.maskSensitiveInfo(env, item.text);
                }
              }
            }

            content.content.unshift([{ tag: "at", user_id: senderId }]);

            const postMessageContent = JSON.stringify({
              zh_cn: content
            });

            await RecallLarkService.sendMessageToThread(
              env,
              event.message.root_id ?? event.message.message_id,
              MESSAGE_TYPE.POST,
              postMessageContent
            );

            await RecallLarkService.recallMessage(
              env,
              event.message.root_id ?? event.message.message_id
            );
          }
        }
      } catch (error) {
        Sentry.captureException(error);
        return;
      }
    } else {
      return;
    }
  }

  static async detectSensitiveInfo(env: any, text: string) {
    const presidioClient = new PresidioClient(env);
    const result = await presidioClient.analyze({ text });
    return result.some((item) => item.score > 0.3);
  }

  static async maskSensitiveInfo(env: any, text: string): Promise<string> {
    const presidioClient = new PresidioClient(env);
    const result = await presidioClient.anonymize({ text });
    return result.text;
  }
}
