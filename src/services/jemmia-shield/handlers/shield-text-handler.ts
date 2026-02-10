import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import JemmiaShieldPresidioService from "services/jemmia-shield/shield-presidio-service";
import { JemmiaShieldUtils } from "services/jemmia-shield/utils/shield-utils";
import { JEMMIA_SHIELD_MESSAGE_TYPE } from "src/constants/jemmia-shield-constants";

export default class JemmiaShieldMessageHandler {
  static async handleTextMessage(env: any, event: any, content: any) {
    const text = content.text;

    if (await JemmiaShieldPresidioService.detectSensitiveInfo(env, text)) {
      const senderId = event.sender.sender_id.open_id;
      const maskedText = await JemmiaShieldPresidioService.maskSensitiveInfo(
        env,
        text
      );

      const mentions = event.message.mentions || [];
      const cardMaskedText = JemmiaShieldUtils.resolveMentionsForCard(
        maskedText,
        mentions
      );

      const viewOriginalText = JemmiaShieldUtils.resolveMentionsAndStyleForView(
        text,
        mentions
      );
      const viewMaskedText = JemmiaShieldUtils.resolveMentionsAndStyleForView(
        maskedText,
        mentions
      );

      const randomId = JemmiaShieldUtils.generateRandomId();
      const formattedText =
        JemmiaShieldUtils.formatTextForLarkMd(cardMaskedText);
      const elements = [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `**ID: ${randomId}**\n<at id="${senderId}"></at>: ${formattedText}`
          }
        }
      ];

      const threadId = event.message.root_id ?? event.message.message_id;
      const viewPayload = {
        original: viewOriginalText,
        masked: viewMaskedText,
        random_id: randomId
      };
      await JemmiaShieldUtils.appendViewButton(
        env,
        elements,
        viewPayload,
        JEMMIA_SHIELD_MESSAGE_TYPE.TEXT,
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
}
