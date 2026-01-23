import RecallLarkService from "services/larksuite/recall-lark.service";
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
    } else if (event.message.message_type === MESSAGE_TYPE.IMAGE) {
      try {
        const imageKey = content.image_key;
        const imageBuffer = await RecallLarkService.getImage(
          env,
          event.message.message_id,
          imageKey
        );
        text = await this.ocrImage(env, imageBuffer);
      } catch (error) {
        Sentry.captureException(error);
        return;
      }
    } else if (event.message.message_type === MESSAGE_TYPE.POST) {
      try {
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
              const ocrText = await this.ocrImage(env, imageBuffer);
              text += ocrText + " ";
            }
          }
        }
      } catch (error) {
        Sentry.captureException(error);
        return;
      }
    } else {
      return;
    }

    if (await this.detectSensitiveInfo(env, text)) {
      await RecallLarkService.recallMessage(env, event.message.message_id);

      const senderId = event.sender.sender_id.open_id;
      const chatId = event.message.chat_id;
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

      if (event.message.root_id) {
        await RecallLarkService.replyMessage(
          env,
          event.message.root_id,
          maskedContent,
          MESSAGE_TYPE.TEXT
        );
      } else {
        await RecallLarkService.sendMessage(
          env,
          chatId,
          "chat_id",
          MESSAGE_TYPE.TEXT,
          maskedContent
        );
      }
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

  static async ocrImage(env: any, imageBuffer: Buffer): Promise<string> {
    try {
      const presidioClient = new PresidioClient(env);
      const { text } = await presidioClient.ocr(imageBuffer);

      return text || "";
    } catch (error) {
      Sentry.captureException(error);
      return "";
    }
  }
}
