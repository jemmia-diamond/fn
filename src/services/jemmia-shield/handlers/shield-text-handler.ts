import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import ShieldPresidioService from "services/jemmia-shield/shield-presidio-service";
import { ShieldUtils } from "services/jemmia-shield/utils/shield-utils";
import { JEMMIA_SHIELD_MESSAGE_TYPE } from "src/constants/jemmia-shield-constants";
import { ShieldPhoneHashLabeler } from "services/jemmia-shield/utils/shield-phone-hash-labeler";

export default class ShieldMessageHandler {
  static async handleTextMessage(env: any, event: any, content: any) {
    const text = content.text;

    if (await ShieldPresidioService.detectSensitiveInfo(env, text)) {
      const senderId = event.sender.sender_id.open_id;
      const maskedText = await ShieldPresidioService.maskSensitiveInfo(
        env,
        text
      );
      const labeledMaskedText =
        await ShieldPhoneHashLabeler.attachLabelsToMasked(text, maskedText);

      const mentions = event.message.mentions || [];
      const cardMaskedText = ShieldUtils.resolveMentionsForCard(
        labeledMaskedText,
        mentions
      );

      const viewOriginalText = ShieldUtils.resolveMentionsAndStyleForView(
        text,
        mentions
      );
      const viewMaskedText = ShieldUtils.resolveMentionsAndStyleForView(
        labeledMaskedText,
        mentions
      );

      const randomId = ShieldUtils.generateRandomId();
      const formattedText = ShieldUtils.formatTextForLarkMd(cardMaskedText);
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
      await ShieldUtils.appendViewButton(
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
