import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import JemmiaShieldPresidioService from "services/jemmia-shield/shield-presidio-service";
import JemmiaShieldNotificationService from "services/jemmia-shield/shield-notification-service";
import { JemmiaShieldUtils } from "services/jemmia-shield/utils/shield-utils";
import {
  JEMMIA_SHIELD_MESSAGE_TYPE,
  JEMMIA_SHIELD_CONTENT_TAG
} from "src/constants/jemmia-shield-constants";
import ImageHelper from "services/utils/image-helper";

export default class JemmiaShieldPostHandler {
  static async handlePostMessage(env: any, event: any, content: any) {
    const hasImages = this.checkIfPostHasImages(content);

    if (hasImages) {
      await this.handlePostWithImages(env, event, content);
    } else {
      await this.handlePostWithoutImages(env, event, content);
    }
  }

  private static checkIfPostHasImages(content: any): boolean {
    if (!content.content) return false;
    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.IMG) {
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
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.IMG) {
          const buffer = imageMap.get(item.image_key);
          if (buffer) {
            item.image_key =
              await JemmiaShieldUtils.reuploadImageForPersistence(
                env,
                buffer,
                item.image_key
              );
          }
        }
      }
    }

    await JemmiaShieldNotificationService.notifyUserAboutSensitiveScan(
      env,
      event
    );

    await JemmiaShieldLarkService.recallMessage(env, event.message.message_id);

    if (content.title) {
      content.title = await JemmiaShieldPresidioService.maskSensitiveInfo(
        env,
        content.title
      );
    }

    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.TEXT) {
          item.text = await JemmiaShieldPresidioService.maskSensitiveInfo(
            env,
            item.text
          );
          item.text = JemmiaShieldUtils.resolveMentionsForCard(
            item.text,
            mentions
          );
        } else if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.IMG) {
          const buffer = imageMap.get(item.image_key);
          if (buffer) {
            const result = await JemmiaShieldPresidioService.analyzeImage(
              env,
              buffer
            );
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
        } else if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.HREF) {
          if (
            await JemmiaShieldPresidioService.detectSensitiveInfo(
              env,
              item.text
            )
          ) {
            item.text = await JemmiaShieldPresidioService.maskSensitiveInfo(
              env,
              item.text
            );
            item.tag = JEMMIA_SHIELD_CONTENT_TAG.TEXT;
            delete item.href;
          }
        }
      }
    }

    const randomId = JemmiaShieldUtils.generateRandomId();
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

    await JemmiaShieldUtils.appendViewButton(
      env,
      elements,
      viewPayload,
      JEMMIA_SHIELD_MESSAGE_TYPE.POST,
      threadId
    );
    const cardContent = JSON.stringify({ elements });

    await JemmiaShieldLarkService.sendMessageToThread(
      env,
      event.message.root_id ?? event.message.message_id,
      JEMMIA_SHIELD_MESSAGE_TYPE.INTERACTIVE,
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
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.TEXT) {
          text += item.text + " ";
        } else if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.HREF) {
          text += item.text + " ";
        }
      }
    }

    if (
      text &&
      (await JemmiaShieldPresidioService.detectSensitiveInfo(env, text))
    ) {
      if (content.title) {
        content.title = await JemmiaShieldPresidioService.maskSensitiveInfo(
          env,
          content.title
        );
      }

      for (const line of content.content) {
        for (const item of line) {
          if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.TEXT) {
            item.text = await JemmiaShieldPresidioService.maskSensitiveInfo(
              env,
              item.text
            );
            item.text = JemmiaShieldUtils.resolveMentionsForCard(
              item.text,
              mentions
            );
          } else if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.HREF) {
            if (
              await JemmiaShieldPresidioService.detectSensitiveInfo(
                env,
                item.text
              )
            ) {
              item.text = await JemmiaShieldPresidioService.maskSensitiveInfo(
                env,
                item.text
              );
              item.tag = JEMMIA_SHIELD_CONTENT_TAG.TEXT;
              delete item.href;
            }
          }
        }
      }

      const randomId = JemmiaShieldUtils.generateRandomId();
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

      await JemmiaShieldUtils.appendViewButton(
        env,
        elements,
        viewPayload,
        JEMMIA_SHIELD_MESSAGE_TYPE.POST,
        threadId
      );
      const cardContent = JSON.stringify({ elements });

      await JemmiaShieldLarkService.sendMessageToThread(
        env,
        event.message.root_id ?? event.message.message_id,
        JEMMIA_SHIELD_MESSAGE_TYPE.INTERACTIVE,
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
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.IMG) {
          const buffer = await JemmiaShieldLarkService.getImage(
            env,
            event.message.message_id,
            item.image_key
          );
          imageMap.set(item.image_key, buffer);
        }
      }
    }
    return imageMap;
  }

  private static mapPostToCardElements(content: any): any[] {
    const elements: any[] = [];
    let currentTextBlock = "";

    if (content.title) {
      currentTextBlock += `${JemmiaShieldUtils.escapeLarkMarkdown(
        content.title
      )}\n`;
    }

    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.TEXT) {
          const text = item.text;
          currentTextBlock += JemmiaShieldUtils.escapeLarkMarkdown(text);
        } else if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.HREF) {
          currentTextBlock += `[${JemmiaShieldUtils.escapeLarkMarkdown(
            item.text
          )}](${item.href})`;
        } else if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.AT) {
          currentTextBlock += `<at id="${item.user_id}"></at>`;
        } else if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.IMG) {
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

  private static resolvePostMentions(content: any, mentions: any[]) {
    if (!content.content || !mentions.length) return;
    for (const line of content.content) {
      for (const item of line) {
        if (item.tag === JEMMIA_SHIELD_CONTENT_TAG.AT) {
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
