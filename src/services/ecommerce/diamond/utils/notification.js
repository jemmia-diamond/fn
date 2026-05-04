import LarksuiteService from "services/larksuite/lark";
import * as Sentry from "@sentry/cloudflare";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";

export const NOTIFICATION_CHAT_IDS = [
  CHAT_GROUPS.PROMOTION_SYNC_NOTIFICATION.chat_id
];

export async function sendPromotionSyncNotification(env, text) {
  try {
    const larkClient = await LarksuiteService.createClientV2(env);

    const promises = NOTIFICATION_CHAT_IDS.map(receiveId =>
      larkClient.im.message.create({
        params: {
          receive_id_type: "chat_id"
        },
        data: {
          receive_id: receiveId,
          msg_type: "text",
          content: JSON.stringify({
            text: text
          })
        }
      }).catch(err => {
        Sentry.captureException(err, { tags: { receiveId } });
      })
    );

    await Promise.all(promises);
  } catch (error) {
    Sentry.captureException(error);
  }
}
