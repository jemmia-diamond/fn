import LarksuiteService from "services/larksuite/lark";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { TIMEZONE_VIETNAM } from "src/constants";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";

dayjs.extend(utc);
dayjs.extend(timezone);

export default class ERPNotificationService {
  static async sendToLark(env: any, msg: string, event?: string, chatId?: string) {
    const client = await LarksuiteService.createClientV2(env);

    const receiveId = chatId;
    if (!receiveId) {
      throw new Error("Could not determine receive_id for Lark notification");
    }

    let finalMsg = msg;
    const now = dayjs().tz(TIMEZONE_VIETNAM).format("HH:mm:ss DD/MM/YYYY");

    if (event === "deploy_start") {
      finalMsg = `[${now}] 🚀 Hệ thống bắt đầu cập nhật, vui lòng thử lại sau 10 phút`;
    } else if (event === "deploy_success") {
      finalMsg = `[${now}] ✅ Hệ thống hoàn thành cập nhật`;
    } else if (event === "deploy_failure") {
      return true;
    }

    const res = await client.im.message.create({
      params: {
        receive_id_type: "chat_id"
      },
      data: {
        receive_id: receiveId,
        msg_type: "text",
        content: JSON.stringify({ text: finalMsg })
      }
    });

    if (res.code !== 0) {
      throw new Error(`Lark SDK error: ${res.msg} (code: ${res.code})`);
    }

    return true;
  }

  static async dequeue(batch: any, env: any) {
    for (const message of batch.messages) {
      const { msg, event, chatId } = message.body as any;
      await this.sendToLark(env, msg, event, chatId);
    }
  }

  static getQueueOptions(event: string) {
    if (event === "deploy_failure") {
      return null;
    }

    return {
      delaySeconds: event === "deploy_success" ? 300 : 0,
      chatId: CHAT_GROUPS.SUPPORT_ERP_SALES.chat_id
    };
  }
}
