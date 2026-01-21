import RecallLarkService from "./recall-lark.service";
import Tesseract from "tesseract.js";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
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
      console.log(
        `Sensitive info detected in message ${event.message.message_id}. Recalling and resending masked version...`,
      );

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
    } else if (await this.detectWithLlm(env, text)) {
      return true;
    }
    return false;
  }

  static detectWithRegex(text: string) {
    const phones = PhoneDetectorHelper.detect(text);
    console.log(phones);
    return phones.length > 0;
  }

  static async detectWithLlm(env: any, text: string) {
    try {
      const OPENROUTER_API_KEY = await env.OPENROUTER_API_KEY_SECRET.get();
      if (!OPENROUTER_API_KEY) {
        console.warn("OpenRouter API Key not found, skipping LLM detection");
        return false;
      }

      const openrouter = createOpenRouter({
        apiKey: OPENROUTER_API_KEY,
      });

      const { object } = await generateObject({
        model: openrouter("x-ai/grok-4.1-fast"),
        schema: z.object({
          phone_numbers: z.array(z.string()),
        }),
        prompt: `
Hãy đóng vai trò là một công cụ trích xuất dữ liệu thông minh chuyên nhận diện số điện thoại Việt Nam. Nhiệm vụ của bạn là tìm và trích xuất tất cả các số điện thoại có trong văn bản, kể cả khi chúng bị viết sai hoặc cố tình viết chèn chữ để tránh bị quét.

Hãy thực hiện theo quy trình tư duy sau:
1. Quét văn bản để tìm các chuỗi ký tự có khả năng là số điện thoại.
2. Chuẩn hóa dữ liệu theo các quy tắc:
   - Chuyển đổi số viết bằng chữ sang số (ví dụ: "không" -> 0, "năm" -> 5, "tam" -> 8, "chin" -> 9).
   - Xử lý các ký tự trông giống số (Homoglyphs): Chuyển 'o', 'O' -> 0; chuyển 'l', 'I', 'i' -> 1; chuyển 'b' -> 6 (nếu ngữ cảnh phù hợp).
   - Loại bỏ các ký tự đặc biệt như dấu chấm, dấu cách, dấu gạch ngang xen giữa các số.
3. Kiểm tra tính hợp lệ: Một số điện thoại Việt Nam hợp lệ sau khi chuẩn hóa phải bắt đầu bằng số 0 (hoặc 84) và thường có 10 chữ số.
4. Output: Chỉ trả về danh sách các số điện thoại đã được chuẩn hóa (dạng 0xxxxxxxxx), mỗi số một dòng. Nếu không tìm thấy, trả về "Không tìm thấy".

Văn bản đầu vào:
${text}
`,
      });

      if (object.phone_numbers && object.phone_numbers.length > 0) {
        console.log("LLM detected phone numbers:", object.phone_numbers);
        return true;
      }
      return false;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
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
