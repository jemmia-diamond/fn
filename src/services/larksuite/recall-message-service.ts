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
    let postText = "";

    if (event.message.message_type === MESSAGE_TYPE.TEXT) {
      text = content.text;

      if (await this.detectSensitiveInfo(env, text)) {
        // await RecallLarkService.recallMessage(env, event.message.message_id);

        const senderId = event.sender.sender_id.open_id;
        let responseText = "";

        if (event.message.message_type === MESSAGE_TYPE.IMAGE) {
          responseText = `<at user_id="${senderId}"></at> Ảnh đã bị thu hồi vì chứa thông tin của khách hàng`;
        } else if (event.message.message_type === MESSAGE_TYPE.POST) {
          const maskedText = await this.maskSensitiveInfo(env, postText);
          responseText = `<at user_id="${senderId}"></at> Ảnh đã bị thu hồi vì chứa thông tin của khách hàng, ${maskedText}`;
        } else {
          const maskedText = await this.maskSensitiveInfo(env, text);
          responseText = `<at user_id="${senderId}"></at>: ${maskedText}`;
        }

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

        const senderId = event.sender.sender_id.open_id;
        const responseText = `<at user_id="${senderId}"></at> Ảnh đã bị thu hồi vì chứa thông tin của khách hàng`;

        await RecallLarkService.sendMessageToThread(
          env,
          event.message.root_id ?? event.message.message_id,
          MESSAGE_TYPE.TEXT,
          JSON.stringify({ text: responseText })
        );

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
        await RecallLarkService.sendMessageToThread(
          env,
          event.message.root_id ?? event.message.message_id,
          MESSAGE_TYPE.TEXT,
          JSON.stringify({
            text: "Tin nhắn đang được kiểm tra, vui lòng đợi..."
          })
        );

        if (content.title) {
          text += content.title + " ";
          postText += content.title + " ";
        }
        for (const line of content.content) {
          for (const item of line) {
            if (item.tag === CONTENT_TAG.TEXT) {
              text += item.text + " ";
              postText += item.text + " ";
            } else if (item.tag === CONTENT_TAG.IMG) {
              const imageKey = item.image_key;
              const imageBuffer = await RecallLarkService.getImage(
                env,
                event.message.message_id,
                imageKey
              );

              // Check for sensitive info in image
              const presidioClient = new PresidioClient(env);
              const anonymizeResult =
                await presidioClient.anonymizeImage(imageBuffer);

              if (anonymizeResult.has_sensitive_info) {
                // Upload anonymized image
                const base64Data = anonymizeResult.image.split(",")[1];
                const anonymizedBuffer = Buffer.from(base64Data, "base64");
                const newImageKey = await RecallLarkService.uploadImage(
                  env,
                  anonymizedBuffer
                );

                // Recall original message
                // await RecallLarkService.recallMessage(
                //   env,
                //   event.message.message_id
                // );

                const senderId = event.sender.sender_id.open_id;
                const responseText = `<at user_id="${senderId}"></at> Ảnh đã bị thu hồi vì chứa thông tin của khách hàng`;

                // 1. Send notification text
                if (event.message.root_id) {
                  await RecallLarkService.replyMessage(
                    env,
                    event.message.root_id,
                    JSON.stringify({ text: responseText }),
                    MESSAGE_TYPE.TEXT
                  );
                } else {
                  await RecallLarkService.sendMessage(
                    env,
                    event.message.chat_id,
                    "chat_id",
                    MESSAGE_TYPE.TEXT,
                    JSON.stringify({ text: responseText })
                  );
                }

                // 2. Send anonymized image
                const imageContent = JSON.stringify({ image_key: newImageKey });
                if (event.message.root_id) {
                  await RecallLarkService.replyMessage(
                    env,
                    event.message.root_id,
                    imageContent,
                    MESSAGE_TYPE.IMAGE
                  );
                } else {
                  await RecallLarkService.sendMessage(
                    env,
                    event.message.chat_id,
                    "chat_id",
                    MESSAGE_TYPE.IMAGE,
                    imageContent
                  );
                }

                return; // Stop processing after recalling
              }
            }
          }
        }

        if (text && (await this.detectSensitiveInfo(env, text))) {
          const maskedText = await this.maskSensitiveInfo(env, text);

          const maskedContent = JSON.stringify({
            text: maskedText
          });

          await RecallLarkService.sendMessageToThread(
            env,
            event.message.root_id ?? event.message.message_id,
            MESSAGE_TYPE.TEXT,
            maskedContent
          );
        }

        await RecallLarkService.recallMessage(
          env,
          event.message.root_id ?? event.message.message_id
        );
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
    return result.some((item) => item.score > 0.5);
  }

  static async maskSensitiveInfo(env: any, text: string): Promise<string> {
    const presidioClient = new PresidioClient(env);
    const result = await presidioClient.anonymize({ text });
    return result.text;
  }
}
