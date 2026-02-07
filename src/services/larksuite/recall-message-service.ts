import RecallLarkService from "services/larksuite/recall-lark-service";
import * as Sentry from "@sentry/cloudflare";
import PresidioClient from "services/clients/presidio-client";

export const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  INTERACTIVE: "interactive",
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

      const elements = [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `<at id="${senderId}"></at>: ${maskedText}`
          }
        }
      ];

      const threadId = event.message.root_id ?? event.message.message_id;
      const viewPayload = {
        original: text,
        masked: maskedText
      };
      await this.appendViewButton(
        env,
        elements,
        viewPayload,
        MESSAGE_TYPE.TEXT,
        threadId
      );
      const cardContent = JSON.stringify({ elements });

      await RecallLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.INTERACTIVE,
        cardContent
      );

      await RecallLarkService.recallMessage(env, event.message.message_id);
    }
  }

  private static async reuploadImageForPersistence(
    env: any,
    imageBuffer: Buffer,
    originalKey: string
  ): Promise<string> {
    try {
      return await RecallLarkService.uploadImage(env, imageBuffer);
    } catch (error) {
      console.warn("Failed to re-upload image for persistence", error);
      return originalKey;
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

      const imageKey = content.image_key;
      const imageBuffer = await RecallLarkService.getImage(
        env,
        event.message.message_id,
        imageKey
      );

      // Re-upload original image to ensure persistence accessible by bot
      const appOwnedImageKey = await this.reuploadImageForPersistence(
        env,
        imageBuffer,
        imageKey
      );

      await RecallLarkService.recallMessage(env, event.message.message_id);

      const presidioClient = new PresidioClient(env);
      const anonymizeResult = await presidioClient.anonymizeImage(imageBuffer);

      const base64Data = anonymizeResult.image.split(",")[1];
      const anonymizedBuffer = Buffer.from(base64Data, "base64");
      const newImageKey = await RecallLarkService.uploadImage(
        env,
        anonymizedBuffer
      );

      const elements = [
        {
          tag: "img",
          img_key: newImageKey,
          alt: {
            tag: "plain_text",
            content: "Sensitive Image"
          }
        }
      ];

      const threadId = event.message.root_id ?? event.message.message_id;

      const viewPayload = {
        original: { image_key: appOwnedImageKey },
        masked: { image_key: newImageKey }
      };

      await this.appendViewButton(
        env,
        elements,
        viewPayload,
        MESSAGE_TYPE.IMAGE,
        threadId,
        "Xem ảnh gốc"
      );
      const cardContent = JSON.stringify({ elements });

      await RecallLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.INTERACTIVE,
        cardContent
      );
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
    const originalContent = JSON.parse(JSON.stringify(content));
    const senderId = event.sender.sender_id.open_id;
    const imageMap = await this.downloadPostImages(env, event, content);

    // Re-upload images in originalContent to ensure they persist after recall and are accessible via downloadImage
    for (const line of originalContent.content) {
      for (const item of line) {
        if (item.tag === CONTENT_TAG.IMG) {
          const buffer = imageMap.get(item.image_key);
          if (buffer) {
            item.image_key = await this.reuploadImageForPersistence(
              env,
              buffer,
              item.image_key
            );
          }
        }
      }
    }

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

    const elements = this.mapPostToCardElements(content);
    // Prepare payload with message_id for image fetching
    const threadId = event.message.root_id ?? event.message.message_id;
    const viewPayload = {
      original: originalContent,
      masked: content,
      message_id: event.message.message_id
    };

    await this.appendViewButton(
      env,
      elements,
      viewPayload,
      MESSAGE_TYPE.POST,
      threadId
    );
    const cardContent = JSON.stringify({ elements });

    await RecallLarkService.sendMessageToThread(
      env,
      event.message.root_id ?? event.message.message_id,
      MESSAGE_TYPE.INTERACTIVE,
      cardContent
    );
  }

  private static async handlePostWithoutImages(
    env: any,
    event: any,
    content: any
  ) {
    const originalContent = JSON.parse(JSON.stringify(content));
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

      const elements = this.mapPostToCardElements(content);
      const threadId = event.message.root_id ?? event.message.message_id;
      const viewPayload = {
        original: originalContent,
        masked: content,
        message_id: event.message.message_id
      };

      await this.appendViewButton(
        env,
        elements,
        viewPayload,
        MESSAGE_TYPE.POST,
        threadId
      );
      const cardContent = JSON.stringify({ elements });

      await RecallLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.INTERACTIVE,
        cardContent
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

  private static mapPostToCardElements(content: any): any[] {
    const elements: any[] = [];
    if (content.title) {
      elements.push({
        tag: "div",
        text: { tag: "lark_md", content: `**${content.title}**` }
      });
    }

    for (const line of content.content) {
      let lineText = "";
      for (const item of line) {
        if (item.tag === CONTENT_TAG.TEXT) {
          lineText += item.text;
        } else if (item.tag === CONTENT_TAG.HREF) {
          lineText += `[${item.text}](${item.href})`;
        } else if (item.tag === "at") {
          lineText += `<at id="${item.user_id}"></at>`;
        } else if (item.tag === CONTENT_TAG.IMG) {
          if (lineText) {
            elements.push({
              tag: "div",
              text: { tag: "lark_md", content: lineText }
            });
            lineText = "";
          }
          elements.push({
            tag: "img",
            img_key: item.image_key,
            alt: { tag: "plain_text", content: "" }
          });
        }
      }
      if (lineText) {
        elements.push({
          tag: "div",
          text: { tag: "lark_md", content: lineText }
        });
      }
    }
    return elements;
  }

  static async maskSensitiveInfo(env: any, text: string): Promise<string> {
    const presidioClient = new PresidioClient(env);
    const result = await presidioClient.anonymize({ text });
    return result.text;
  }

  public static async appendViewButton(
    env: any,
    elements: any[],
    content: any,
    msgType: string,
    threadId: string,
    buttonText: string = "Xem tin nhắn"
  ) {
    const appLink = await RecallLarkService.generateViewMessageUrl(
      env,
      content,
      msgType,
      threadId
    );

    elements.push({
      tag: "action",
      actions: [
        {
          tag: "button",
          text: {
            tag: "plain_text",
            content: buttonText
          },
          type: "default",
          url: appLink
        }
      ]
    });
  }
}
