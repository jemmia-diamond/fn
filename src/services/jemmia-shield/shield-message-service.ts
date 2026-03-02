import ShieldMessageHandler from "services/jemmia-shield/handlers/shield-text-handler";
import ShieldImageHandler from "services/jemmia-shield/handlers/shield-image-handler";
import ShieldPostHandler from "services/jemmia-shield/handlers/shield-post-handler";
import { JEMMIA_SHIELD_MESSAGE_TYPE } from "src/constants/jemmia-shield-constants";
import { ShieldOrderMentionLinker } from "services/jemmia-shield/utils/shield-order-mention-linker";

export default class ShieldMessageService {
  static async detectSensitiveInfoAndMask(env: any, event: any) {
    const content = JSON.parse(event.message.content);
    await ShieldOrderMentionLinker.replyOrderLinksIfMentioned(env, event);

    switch (event.message.message_type) {
    case JEMMIA_SHIELD_MESSAGE_TYPE.TEXT:
      await ShieldMessageHandler.handleTextMessage(env, event, content);
      break;
    case JEMMIA_SHIELD_MESSAGE_TYPE.IMAGE:
      await ShieldImageHandler.handleImageMessage(env, event, content);
      break;
    case JEMMIA_SHIELD_MESSAGE_TYPE.POST:
      await ShieldPostHandler.handlePostMessage(env, event, content);
      break;
    }
  }
}
