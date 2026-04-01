import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import ShieldPresidioService from "services/jemmia-shield/shield-presidio-service";
import ShieldNotificationService from "services/jemmia-shield/shield-notification-service";
import { ShieldUtils } from "services/jemmia-shield/utils/shield-utils";
import {
  JEMMIA_SHIELD_MESSAGE_TYPE,
  JEMMIA_SHIELD_NER_SCORE_THRESHOLD
} from "src/constants/jemmia-shield-constants";
import ImageHelper from "services/utils/image-helper";

export default class ShieldImageHandler {
  static async handleImageMessage(env: any, event: any, content: any) {
    const imageKey = content.image_key;
    const imageBuffer = await JemmiaShieldLarkService.getImage(
      env,
      event.message.message_id,
      imageKey
    );

    const analyzeResult = await ShieldPresidioService.analyzeImage(
      env,
      imageBuffer
    );

    const isSensitive =
      analyzeResult.ner_results.length > 0 &&
      analyzeResult.ner_results.some(
        (result) => result.score >= JEMMIA_SHIELD_NER_SCORE_THRESHOLD
      );

    if (!isSensitive) {
      return;
    }

    await ShieldNotificationService.notifyUserAboutSensitiveScan(env, event);

    const appOwnedImageKey = await ShieldUtils.reuploadImageForPersistence(
      env,
      imageBuffer,
      imageKey
    );

    await JemmiaShieldLarkService.recallMessage(env, event.message.message_id);

    const bufferToUpload = await ImageHelper.blurImage(imageBuffer, {
      blurSize: 24
    });

    const newImageKey = await JemmiaShieldLarkService.uploadImage(
      env,
      bufferToUpload
    );

    const randomId = ShieldUtils.generateRandomId();
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

    await ShieldUtils.appendViewButton(
      env,
      elements,
      viewPayload,
      JEMMIA_SHIELD_MESSAGE_TYPE.IMAGE,
      threadId,
      "Xem ảnh gốc"
    );
    const cardContent = JSON.stringify({ elements });

    await JemmiaShieldLarkService.sendMessageToThread(
      env,
      event.message.root_id ?? event.message.message_id,
      JEMMIA_SHIELD_MESSAGE_TYPE.INTERACTIVE,
      cardContent
    );
  }
}
