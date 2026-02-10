import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import JemmiaShieldPresidioService from "services/jemmia-shield/shield-presidio-service";
import JemmiaShieldNotificationService from "services/jemmia-shield/shield-notification-service";
import { JemmiaShieldUtils } from "services/jemmia-shield/utils/shield-utils";
import { JEMMIA_SHIELD_MESSAGE_TYPE } from "src/constants/jemmia-shield-constants";
import ImageHelper from "services/utils/image-helper";

export default class JemmiaShieldImageHandler {
  static async handleImageMessage(env: any, event: any, content: any) {
    await JemmiaShieldNotificationService.notifyUserAboutSensitiveScan(
      env,
      event
    );

    const imageKey = content.image_key;
    const imageBuffer = await JemmiaShieldLarkService.getImage(
      env,
      event.message.message_id,
      imageKey
    );

    const appOwnedImageKey =
      await JemmiaShieldUtils.reuploadImageForPersistence(
        env,
        imageBuffer,
        imageKey
      );

    await JemmiaShieldLarkService.recallMessage(env, event.message.message_id);

    const analyzeResult = await JemmiaShieldPresidioService.analyzeImage(
      env,
      imageBuffer
    );

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

    const randomId = JemmiaShieldUtils.generateRandomId();
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

    await JemmiaShieldUtils.appendViewButton(
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
