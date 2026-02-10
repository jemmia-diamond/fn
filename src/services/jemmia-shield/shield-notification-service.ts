import JemmiaShieldLarkService from "services/jemmia-shield/jemmia-shield-lark-service";
import { JEMMIA_SHIELD_MESSAGE_TYPE } from "src/constants/jemmia-shield-constants";

export default class JemmiaShieldNotificationService {
  static async notifyUserAboutSensitiveScan(env: any, event: any) {
    const senderId = event.sender.sender_id.open_id;
    await JemmiaShieldLarkService.sendMessage(
      env,
      senderId,
      "open_id",
      JEMMIA_SHIELD_MESSAGE_TYPE.TEXT,
      JSON.stringify({
        text: "Tin nhắn của bạn đang được rà soát dữ liệu nhạy cảm. Vui lòng đợi!"
      })
    );

    const threadId = event.message.root_id ?? event.message.message_id;
    await JemmiaShieldLarkService.sendMessageToThread(
      env,
      threadId,
      JEMMIA_SHIELD_MESSAGE_TYPE.TEXT,
      JSON.stringify({
        text: "Đang rà soát dữ liệu nhạy cảm. Vui lòng đợi!"
      })
    );
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
          JEMMIA_SHIELD_MESSAGE_TYPE.INTERACTIVE,
          JSON.stringify(cardContent)
        );
      }
    }
  }
}
