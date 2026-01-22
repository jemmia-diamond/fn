import RecallLarkService from "./recall-lark.service";
import Tesseract from "tesseract.js";
import { PhoneDetectorHelper } from "services/utils/phone-detector-helper";
import * as Sentry from "@sentry/cloudflare";

const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  POST: "post",
} as const;

const CONTENT_TAG = {
  TEXT: "text",
  IMG: "img",
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
          imageKey,
        );
        text = await this.ocrImage(imageBuffer);
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
                imageKey,
              );
              const ocrText = await this.ocrImage(imageBuffer);
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
        const maskedText = this.maskSensitiveInfo(postText);
        responseText = `<at user_id="${senderId}"></at> Ảnh đã bị thu hồi vì chứa thông tin của khách hàng, ${maskedText}`;
      } else {
        const maskedText = this.maskSensitiveInfo(text);
        responseText = `<at user_id="${senderId}"></at>: ${maskedText}`;
      }

      const maskedContent = JSON.stringify({
        text: responseText,
      });

      if (event.message.root_id) {
        await RecallLarkService.replyMessage(
          env,
          event.message.root_id,
          maskedContent,
          MESSAGE_TYPE.TEXT,
        );
      } else {
        await RecallLarkService.sendMessage(
          env,
          chatId,
          "chat_id",
          MESSAGE_TYPE.TEXT,
          maskedContent,
        );
      }
    }
  }

  static maskSensitiveInfo(text: string): string {
    return PhoneDetectorHelper.maskText(text);
  }

  static async detectSensitiveInfo(env: any, text: string) {
    if (this.detectWithRegex(text)) {
      return true;
    }
    return false;
  }

  static detectWithRegex(text: string) {
    const phones = PhoneDetectorHelper.detect(text);
    return phones.length > 0;
  }

  static async ocrImage(imageBuffer: Buffer): Promise<string> {
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(imageBuffer, "vie+eng");

      return text || "";
    } catch (error) {
      Sentry.captureException(error);
      return "";
    }
  }
}
