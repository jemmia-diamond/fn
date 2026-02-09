import RecallLarkService from "services/larksuite/recall-lark-service";
import * as Sentry from "@sentry/cloudflare";
import PresidioClient from "services/clients/presidio-client";
import ImageHelper from "services/utils/image-helper";

export const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  INTERACTIVE: "interactive",
  POST: "post"
} as const;

const CONTENT_TAG = {
  TEXT: "text",
  IMG: "img",
  HREF: "a",
  AT: "at"
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

      // Resolve mentions for Card (using <at> tag)
      const mentions = event.message.mentions || [];
      const cardMaskedText = this.resolveMentionsForCard(maskedText, mentions);

      // Resolve mentions for Web View (using @Name to be readable)
      const viewOriginalText = this.resolveMentionsAndStyleForView(
        text,
        mentions
      );
      const viewMaskedText = this.resolveMentionsAndStyleForView(
        maskedText,
        mentions
      );

      const elements = [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `<at id="${senderId}"></at>: ${this.formatText(cardMaskedText)}`
          }
        }
      ];

      const threadId = event.message.root_id ?? event.message.message_id;
      const viewPayload = {
        original: viewOriginalText,
        masked: viewMaskedText
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

  private static async notifyUserAboutSensitiveScan(env: any, event: any) {
    const senderId = event.sender.sender_id.open_id;
    await RecallLarkService.sendMessage(
      env,
      senderId,
      "open_id",
      MESSAGE_TYPE.TEXT,
      JSON.stringify({
        text: "Tin nhắn của bạn đang được rà soát dữ liệu nhạy cảm. Vui lòng đợi!"
      })
    );

    const threadId = event.message.root_id ?? event.message.message_id;
    await RecallLarkService.sendMessageToThread(
      env,
      threadId,
      MESSAGE_TYPE.TEXT,
      JSON.stringify({
        text: "Đang rà soát dữ liệu nhạy cảm. Vui lòng đợi!"
      })
    );
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
      await this.notifyUserAboutSensitiveScan(env, event);

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
      const analyzeResult = await presidioClient.analyzeImage(imageBuffer);

      let bufferToUpload = imageBuffer;
      if (
        analyzeResult.has_handwriting ||
        analyzeResult.ner_results.length > 0 ||
        analyzeResult.ocr_results.length > 0
      ) {
        bufferToUpload = await ImageHelper.blurImage(imageBuffer, {
          blurSize: 24
        });
      }

      const newImageKey = await RecallLarkService.uploadImage(
        env,
        bufferToUpload
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
    // const senderId = event.sender.sender_id.open_id;
    const mentions = event.message.mentions || [];

    // Resolve mentions for both original and masked content
    this.resolvePostMentions(originalContent, mentions);
    this.resolvePostMentions(content, mentions);
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

    await this.notifyUserAboutSensitiveScan(env, event);

    await RecallLarkService.recallMessage(env, event.message.message_id);

    if (content.title) {
      content.title = await this.maskSensitiveInfo(env, content.title);
    }

    const presidioClient = new PresidioClient(env);

    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === CONTENT_TAG.TEXT) {
          item.text = await this.maskSensitiveInfo(env, item.text);
          // Resolve mentions in text keys if present (e.g. @_user_1)
          item.text = this.resolveMentionsForCard(item.text, mentions);
        } else if (item.tag === CONTENT_TAG.IMG) {
          const buffer = imageMap.get(item.image_key);
          if (buffer) {
            const result = await presidioClient.analyzeImage(buffer);
            let bufferToUpload = buffer;
            if (
              result.has_handwriting ||
              result.ner_results.length > 0 ||
              result.ocr_results.length > 0
            ) {
              bufferToUpload = await ImageHelper.blurImage(buffer, {
                blurSize: 24
              });
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
        } else if (item.tag === CONTENT_TAG.AT) {
          // Mentions are already resolved by resolvePostMentions
        }
      }
    }

    // this.prependSenderToContent(content, senderId);

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
    const mentions = event.message.mentions || [];

    // Resolve mentions for both original and masked content
    this.resolvePostMentions(originalContent, mentions);
    this.resolvePostMentions(content, mentions);
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
      // const senderId = event.sender.sender_id.open_id;

      if (content.title) {
        content.title = await this.maskSensitiveInfo(env, content.title);
      }

      for (const line of content.content) {
        for (const item of line) {
          if (item.tag === CONTENT_TAG.TEXT) {
            item.text = await this.maskSensitiveInfo(env, item.text);
            // Resolve mentions in text keys if present (e.g. @_user_1)
            item.text = this.resolveMentionsForCard(item.text, mentions);
          } else if (item.tag === CONTENT_TAG.HREF) {
            if (await this.detectSensitiveInfo(env, item.text)) {
              item.text = await this.maskSensitiveInfo(env, item.text);
              item.tag = CONTENT_TAG.TEXT;
              delete item.href;
            }
          } else if (item.tag === CONTENT_TAG.AT) {
            // Mentions are already resolved by resolvePostMentions
          }
        }
      }

      // this.prependSenderToContent(content, senderId);

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
    let currentTextBlock = "";

    if (content.title) {
      currentTextBlock += `${this.escapeLarkMarkdown(content.title)}\n`;
    }

    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === CONTENT_TAG.TEXT) {
          const text = item.text;
          if (item.style) {
            // text style handling removed to prevent conflicts with masked content
          }
          currentTextBlock += this.escapeLarkMarkdown(text);
        } else if (item.tag === CONTENT_TAG.HREF) {
          currentTextBlock += `[${this.escapeLarkMarkdown(item.text)}](${item.href})`;
        } else if (item.tag === CONTENT_TAG.AT) {
          currentTextBlock += `<at id="${item.user_id}"></at>`;
        } else if (item.tag === CONTENT_TAG.IMG) {
          // Flush text block before image
          if (currentTextBlock.trim()) {
            elements.push({
              tag: "div",
              text: { tag: "lark_md", content: currentTextBlock }
            });
            currentTextBlock = "";
          }
          elements.push({
            tag: "img",
            img_key: item.image_key,
            alt: { tag: "plain_text", content: "" }
          });
        } else if (item.tag === "code_block") {
          // Not standard Post tag, but handling just in case
        }
      }
      // Add newline after each line to preserve paragraph structure within the block
      currentTextBlock += "\n";
    }

    // Flush remaining text
    if (currentTextBlock.trim()) {
      elements.push({
        tag: "div",
        text: { tag: "lark_md", content: currentTextBlock }
      });
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

  private static escapeLarkMarkdown(text: string): string {
    return text.replace(/[*]/g, "\\*");
  }

  private static formatText(text: string): string {
    text = this.escapeLarkMarkdown(text);
    // Auto-link URLs
    text = text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
      const match = url.match(/^([^\s]+?)([.,;!?]+)$/);
      if (match) {
        return `[${match[1]}](${match[1]})${match[2]}`;
      }
      return `[${url}](${url})`;
    });
    // Auto-link Emails
    text = text.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g,
      (email) => `[${email}](mailto:${email})`
    );
    return text;
  }

  private static resolveMentionsForCard(text: string, mentions: any[]): string {
    if (!mentions || mentions.length === 0) return text;
    let resolved = text;
    for (const mention of mentions) {
      const id =
        mention.id && typeof mention.id === "object"
          ? mention.id.open_id
          : mention.id;
      if (mention.key && id) {
        // Global replace of key
        resolved = resolved.split(mention.key).join(`<at id="${id}"></at>`);
      }
    }
    return resolved;
  }

  private static resolveMentionsAndStyleForView(
    text: string,
    mentions: any[]
  ): string {
    if (!mentions || mentions.length === 0) return text;
    let resolved = text;
    for (const mention of mentions) {
      if (mention.key && mention.name) {
        // Resolve to @Name
        resolved = resolved.split(mention.key).join(`@${mention.name}`);
      } else if (mention.key) {
        resolved = resolved.split(mention.key).join("@Unknown");
      }
    }
    return resolved;
  }

  private static resolvePostMentions(content: any, mentions: any[]) {
    if (!content.content || !mentions.length) return;
    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === CONTENT_TAG.AT) {
          const mention = mentions.find((m: any) => m.key === item.user_id);
          if (mention) {
            if (mention.id) {
              item.user_id = mention.id.open_id || mention.id;
            }
            if (mention.name) {
              item.text = mention.name;
            } else if (!item.text) {
              item.text = "Unknown";
            }
          }
        }
      }
    }
  }
}
