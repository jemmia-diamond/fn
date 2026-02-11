import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import * as Sentry from "@sentry/cloudflare";
import LarkCipher from "services/larksuite/lark-cipher";

export class ShieldUtils {
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

  static async decryptViewPayload(env: any, data: string): Promise<any> {
    const encryptKey = await env.LARK_SHIELD_ENCRYPT_KEY_SECRET.get();
    const decrypted = await LarkCipher.decryptEvent(data, encryptKey);
    return JSON.parse(decrypted);
  }
  static async reuploadImageForPersistence(
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

  static generateRandomId(): number {
    return Math.floor(Math.random() * 900) + 100;
  }

  static escapeLarkMarkdown(text: string): string {
    return text.replace(/[*]/g, "\\*");
  }

  static formatTextForLarkMd(text: string): string {
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

  static resolveMentionsForCard(text: string, mentions: any[]): string {
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

  static resolveMentionsAndStyleForView(text: string, mentions: any[]): string {
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
}
