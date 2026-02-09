import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import * as Sentry from "@sentry/cloudflare";
import PresidioClient from "services/clients/presidio-client";
import ImageHelper from "services/utils/image-helper";
import LarkCipher from "services/larksuite/lark-cipher";

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

export default class JemmiaShieldMessageService {
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

      const mentions = event.message.mentions || [];
      const cardMaskedText = this.resolveMentionsForCard(maskedText, mentions);

      const viewOriginalText = this.resolveMentionsAndStyleForView(
        text,
        mentions
      );
      const viewMaskedText = this.resolveMentionsAndStyleForView(
        maskedText,
        mentions
      );

      const randomId = this.generateRandomId();
      const elements = [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `**ID: ${randomId}**\n<at id="${senderId}"></at>: ${this.formatText(
              cardMaskedText
            )}`
          }
        }
      ];

      const threadId = event.message.root_id ?? event.message.message_id;
      const viewPayload = {
        original: viewOriginalText,
        masked: viewMaskedText,
        random_id: randomId
      };
      await this.appendViewButton(
        env,
        elements,
        viewPayload,
        MESSAGE_TYPE.TEXT,
        threadId
      );
      const cardContent = JSON.stringify({ elements });

      await JemmiaShieldLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.INTERACTIVE,
        cardContent
      );

      await JemmiaShieldLarkService.recallMessage(
        env,
        event.message.message_id
      );
    }
  }

  private static async notifyUserAboutSensitiveScan(env: any, event: any) {
    const senderId = event.sender.sender_id.open_id;
    await JemmiaShieldLarkService.sendMessage(
      env,
      senderId,
      "open_id",
      MESSAGE_TYPE.TEXT,
      JSON.stringify({
        text: "Tin nhắn của bạn đang được rà soát dữ liệu nhạy cảm. Vui lòng đợi!"
      })
    );

    const threadId = event.message.root_id ?? event.message.message_id;
    await JemmiaShieldLarkService.sendMessageToThread(
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
      return await JemmiaShieldLarkService.uploadImage(env, imageBuffer);
    } catch (error) {
      Sentry.captureException(error);
      return originalKey;
    }
  }

  private static async handleImageMessage(env: any, event: any, content: any) {
    try {
      await this.notifyUserAboutSensitiveScan(env, event);

      const imageKey = content.image_key;
      const imageBuffer = await JemmiaShieldLarkService.getImage(
        env,
        event.message.message_id,
        imageKey
      );

      const appOwnedImageKey = await this.reuploadImageForPersistence(
        env,
        imageBuffer,
        imageKey
      );

      await JemmiaShieldLarkService.recallMessage(
        env,
        event.message.message_id
      );

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

      const newImageKey = await JemmiaShieldLarkService.uploadImage(
        env,
        bufferToUpload
      );

      const randomId = this.generateRandomId();
      const elements = [
        {
          tag: "img",
          img_key: newImageKey,
          alt: {
            tag: "plain_text",
            content: `**ID: ${randomId}** Sensitive Image`
          }
        }
      ];

      const threadId = event.message.root_id ?? event.message.message_id;

      const viewPayload = {
        original: { image_key: appOwnedImageKey },
        masked: { image_key: newImageKey },
        random_id: randomId
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

      await JemmiaShieldLarkService.sendMessageToThread(
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
    const mentions = event.message.mentions || [];

    this.resolvePostMentions(originalContent, mentions);
    this.resolvePostMentions(content, mentions);
    const imageMap = await this.downloadPostImages(env, event, content);

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

    await JemmiaShieldLarkService.recallMessage(env, event.message.message_id);

    if (content.title) {
      content.title = await this.maskSensitiveInfo(env, content.title);
    }

    const presidioClient = new PresidioClient(env);

    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === CONTENT_TAG.TEXT) {
          item.text = await this.maskSensitiveInfo(env, item.text);
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
            const newKey = await JemmiaShieldLarkService.uploadImage(
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

    const randomId = this.generateRandomId();
    const elements = this.mapPostToCardElements(content);
    elements.unshift({
      tag: "div",
      text: {
        tag: "lark_md",
        content: `**ID: ${randomId}**`
      }
    });

    const threadId = event.message.root_id ?? event.message.message_id;
    const viewPayload = {
      original: originalContent,
      masked: content,
      message_id: event.message.message_id,
      random_id: randomId
    };

    await this.appendViewButton(
      env,
      elements,
      viewPayload,
      MESSAGE_TYPE.POST,
      threadId
    );
    const cardContent = JSON.stringify({ elements });

    await JemmiaShieldLarkService.sendMessageToThread(
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
      if (content.title) {
        content.title = await this.maskSensitiveInfo(env, content.title);
      }

      for (const line of content.content) {
        for (const item of line) {
          if (item.tag === CONTENT_TAG.TEXT) {
            item.text = await this.maskSensitiveInfo(env, item.text);
            item.text = this.resolveMentionsForCard(item.text, mentions);
          } else if (item.tag === CONTENT_TAG.HREF) {
            if (await this.detectSensitiveInfo(env, item.text)) {
              item.text = await this.maskSensitiveInfo(env, item.text);
              item.tag = CONTENT_TAG.TEXT;
              delete item.href;
            }
          }
        }
      }

      const randomId = this.generateRandomId();
      const elements = this.mapPostToCardElements(content);
      elements.unshift({
        tag: "div",
        text: {
          tag: "lark_md",
          content: `**ID: ${randomId}**`
        }
      });

      const threadId = event.message.root_id ?? event.message.message_id;
      const viewPayload = {
        original: originalContent,
        masked: content,
        message_id: event.message.message_id,
        random_id: randomId
      };

      await this.appendViewButton(
        env,
        elements,
        viewPayload,
        MESSAGE_TYPE.POST,
        threadId
      );
      const cardContent = JSON.stringify({ elements });

      await JemmiaShieldLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        MESSAGE_TYPE.INTERACTIVE,
        cardContent
      );

      await JemmiaShieldLarkService.recallMessage(
        env,
        event.message.message_id
      );
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
            const buffer = await JemmiaShieldLarkService.getImage(
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
          currentTextBlock += this.escapeLarkMarkdown(text);
        } else if (item.tag === CONTENT_TAG.HREF) {
          currentTextBlock += `[${this.escapeLarkMarkdown(item.text)}](${item.href})`;
        } else if (item.tag === CONTENT_TAG.AT) {
          currentTextBlock += `<at id="${item.user_id}"></at>`;
        } else if (item.tag === CONTENT_TAG.IMG) {
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
        }
      }
      currentTextBlock += "\n";
    }

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
    const appLink = await JemmiaShieldLarkService.generateViewMessageUrl(
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
    text = text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
      const match = url.match(/^([^\s]+?)([.,;!?]+)$/);
      if (match) {
        return `[${match[1]}](${match[1]})${match[2]}`;
      }
      return `[${url}](${url})`;
    });
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

  static async decryptViewPayload(env: any, data: string): Promise<any> {
    const encryptKey = await env.LARK_SHIELD_ENCRYPT_KEY_SECRET.get();
    const decrypted = await LarkCipher.decryptEvent(data, encryptKey);
    return JSON.parse(decrypted);
  }

  static async sendSensitiveViewNotification(
    env: any,
    code: string,
    payload: any,
    type: string
  ): Promise<void> {
    const userToken = await JemmiaShieldLarkService.getUserAccessToken(
      env,
      code
    );
    const userInfo = await JemmiaShieldLarkService.getUserInfo(
      env,
      userToken.access_token
    );

    const openId = userToken.open_id || userInfo.open_id;

    if (payload.thread_id) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).formatToParts(new Date());
      const getPart = (t: string) => parts.find((p) => p.type === t)?.value;
      const day = Number(getPart("day"));
      const month = Number(getPart("month"));
      const time = `${day} tháng ${month} , ${getPart("year")} ${getPart(
        "hour"
      )}:${getPart("minute")}:${getPart("second")}`;

      let maskedContent = payload.masked;
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
      if (typeof maskedPayload === "object" && maskedPayload !== null) {
        maskedPayload.is_masked = true;
        if (!maskedPayload.thread_id && payload.thread_id) {
          maskedPayload.thread_id = payload.thread_id;
        }
      }

      const cardContent = {
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: "div",
            text: {
              tag: "lark_md",
              content: `<at id="${openId}"></at> đã xem tin nhắn **${
                payload.random_id || "N/A"
              }** có chứa thông tin nhạy cảm vào lúc **${time}**`
            }
          }
        ]
      };

      if (!payload.is_masked) {
        await JemmiaShieldLarkService.sendMessageToThread(
          env,
          payload.thread_id,
          MESSAGE_TYPE.INTERACTIVE,
          JSON.stringify(cardContent)
        );
      }
    }
  }

  private static generateRandomId(): number {
    return Math.floor(Math.random() * 900) + 100;
  }
}
