import LarksuiteService from "services/larksuite/lark";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { TIMEZONE_VIETNAM } from "src/constants";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";

dayjs.extend(utc);
dayjs.extend(timezone);

const NOTIFICATION_SOURCES: Record<string, any> = {
  ERP: {
    name: "erp",
    chatId: CHAT_GROUPS.SUPPORT_ERP_SALES.chat_id,
    events: {
      "deploy_start": {
        message: (now: string) => `[${now}] 🚀 Hệ thống ERP bắt đầu cập nhật, vui lòng thử lại sau 10 phút`,
        delaySeconds: 0
      },
      "deploy_success": {
        message: (now: string) => `[${now}] ✅ Hệ thống ERP hoàn thành cập nhật`,
        delaySeconds: 300
      },
      "deploy_failure": {
        silent: true,
        delaySeconds: 0
      }
    }
  }
};

export default class DeploymentNotificationService {
  static async sendToLark(env: any, msg: string, event?: string, chatId?: string, source?: string) {
    const client = await LarksuiteService.createClientV2(env);

    const receiveId = chatId;
    if (!receiveId) {
      throw new Error("Could not determine receive_id for Lark notification");
    }

    let finalMsg = msg;
    const now = dayjs().tz(TIMEZONE_VIETNAM).format("HH:mm:ss DD/MM/YYYY");

    const sourceConfig = Object.values(NOTIFICATION_SOURCES).find(s => s.name === source);
    if (!sourceConfig) return;

    const eventConfig = sourceConfig.events[event || ""];
    if (!eventConfig || eventConfig.silent) return;

    if (typeof eventConfig.message === "function") {
      finalMsg = eventConfig.message(now);
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
      const { msg, event, chatId, source } = message.body as any;
      await this.sendToLark(env, msg, event, chatId, source);
    }
  }

  static getQueueOptions(event: string, source?: string) {
    const sourceConfig = Object.values(NOTIFICATION_SOURCES).find(s => s.name === source);
    if (!sourceConfig) return null;

    const eventConfig = sourceConfig.events[event];
    if (!eventConfig || eventConfig.silent) return null;

    return {
      delaySeconds: eventConfig.delaySeconds || 0,
      chatId: sourceConfig.chatId
    };
  }
}
