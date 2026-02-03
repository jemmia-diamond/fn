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
  IMG: "img",
  HREF: "a"
} as const;

export default class RecallMessageService {
  static async detectSensitiveInfoAndMask(env: any, event: any) {
    const content = JSON.parse(event.message.content);

    switch (event.message.message_type) {
    case MESSAGE_TYPE.TEXT:
      await this.handleTextMessage(env, event, content);
      break;
    case MESSAGE_TYPE.IMAGE:
      await this.handleImageMessage(env, event, content);
      break;
    case MESSAGE_TYPE.POST:
      await this.handlePostMessage(env, event, content);
      break;
    }
  }

  private static async handleTextMessage(env: any, event: any, content: any) {
    const text = content.text;

    if (await this.detectSensitiveInfo(env, text)) {
      const senderId = event.sender.sender_id.open_id;
      const maskedText = await this.maskSensitiveInfo(env, text);
      const responseText = `<at user_id="${senderId}"></at>: ${maskedText}`;

      const maskedContent = JSON.stringify({
        text: responseText
      });

      await RecallLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.TEXT,
        maskedContent
      );

      await RecallLarkService.recallMessage(env, event.message.message_id);
    }
  }

  private static async handleImageMessage(env: any, event: any, content: any) {
    try {
      await RecallLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.TEXT,
        JSON.stringify({
          text: "Phát hiện dữ liệu nhạy cảm trong hình ảnh. Xin vui lòng đợi..."
        })
      );

      await RecallLarkService.recallMessage(env, event.message.message_id);

      const imageKey = content.image_key;
      const imageBuffer = await RecallLarkService.getImage(
        env,
        event.message.message_id,
        imageKey
      );

      // Check for sensitive info in image
      const presidioClient = new PresidioClient(env);
      const anonymizeResult = await presidioClient.anonymizeImage(imageBuffer);

      // Upload anonymized image
      const base64Data = anonymizeResult.image.split(",")[1];
      const anonymizedBuffer = Buffer.from(base64Data, "base64");
      const newImageKey = await RecallLarkService.uploadImage(
        env,
        anonymizedBuffer
      );

      // 2. Send anonymized image
      const imageContent = JSON.stringify({ image_key: newImageKey });
      await RecallLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.IMAGE,
        imageContent
      );

      await RecallLarkService.recallMessage(env, event.message.message_id);
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  private static async handlePostMessage(env: any, event: any, content: any) {
    try {
      const hasImages = this.checkIfPostHasImages(content);

      if (hasImages) {
        await this.handlePostWithImages(env, event, content);
      } else {
        await this.handlePostWithoutImages(env, event, content);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  private static checkIfPostHasImages(content: any): boolean {
    if (!content.content) return false;
    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === CONTENT_TAG.IMG) {
          return true;
        }
      }
    }
    return false;
  }

  private static async handlePostWithImages(
    env: any,
    event: any,
    content: any
  ) {
    const senderId = event.sender.sender_id.open_id;
    const imageMap = await this.downloadPostImages(env, event, content);

    await RecallLarkService.sendMessageToThread(
      env,
      event.message.root_id ?? event.message.message_id,
      MESSAGE_TYPE.TEXT,
      JSON.stringify({
        text: "Phát hiện dữ liệu nhạy cảm trong hình ảnh. Xin vui lòng đợi..."
      })
    );

    await RecallLarkService.recallMessage(env, event.message.message_id);

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
        } else if (item.tag === CONTENT_TAG.HREF) {
          if (await this.detectSensitiveInfo(env, item.text)) {
            item.text = await this.maskSensitiveInfo(env, item.text);
            item.tag = CONTENT_TAG.TEXT;
            delete item.href;
          }
        }
      }
    }

    this.prependSenderToContent(content, senderId);

    const postMessageContent = JSON.stringify({
      zh_cn: content
    });

    await RecallLarkService.sendMessageToThread(
      env,
      event.message.root_id ?? event.message.message_id,
      MESSAGE_TYPE.POST,
      postMessageContent
    );
  }

  private static async handlePostWithoutImages(
    env: any,
    event: any,
    content: any
  ) {
    let text = "";
    if (content.title) {
      text += content.title + " ";
    }
    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === CONTENT_TAG.TEXT) {
          text += item.text + " ";
        } else if (item.tag === CONTENT_TAG.HREF) {
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
          } else if (item.tag === CONTENT_TAG.HREF) {
            if (await this.detectSensitiveInfo(env, item.text)) {
              item.text = await this.maskSensitiveInfo(env, item.text);
              item.tag = CONTENT_TAG.TEXT;
              delete item.href;
            }
          }
        }
      }

      this.prependSenderToContent(content, senderId);

      const postMessageContent = JSON.stringify({
        zh_cn: content
      });

      await RecallLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.POST,
        postMessageContent
      );

      await RecallLarkService.recallMessage(env, event.message.message_id);
    }
  }

  private static async downloadPostImages(
    env: any,
    event: any,
    content: any
  ): Promise<Map<string, Buffer>> {
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
    return imageMap;
  }

  private static prependSenderToContent(content: any, senderId: string) {
    if (!content.content) {
      content.content = [];
    }
    content.content.unshift([{ tag: "at", user_id: senderId }]);
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
