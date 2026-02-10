import JemmiaShieldMessageHandler from "services/jemmia-shield/handlers/shield-text-handler";
import JemmiaShieldImageHandler from "services/jemmia-shield/handlers/shield-image-handler";
import JemmiaShieldPostHandler from "services/jemmia-shield/handlers/shield-post-handler";
import { JEMMIA_SHIELD_MESSAGE_TYPE } from "src/constants/jemmia-shield-constants";

export default class JemmiaShieldMessageService {
  static async detectSensitiveInfoAndMask(env: any, event: any) {
    const content = JSON.parse(event.message.content);
    switch (event.message.message_type) {
    case JEMMIA_SHIELD_MESSAGE_TYPE.TEXT:
      await JemmiaShieldMessageHandler.handleTextMessage(env, event, content);
      break;
    case JEMMIA_SHIELD_MESSAGE_TYPE.IMAGE:
      await JemmiaShieldImageHandler.handleImageMessage(env, event, content);
      break;
    case JEMMIA_SHIELD_MESSAGE_TYPE.POST:
      await JemmiaShieldPostHandler.handlePostMessage(env, event, content);
      break;
    }
  }
}
