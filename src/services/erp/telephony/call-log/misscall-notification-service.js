import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import LarksuiteService from "services/larksuite/lark";
import { retryRequest } from "services/utils/retry-utils";
import { TIMEZONE_VIETNAM } from "src/constants";
import FrappeClient from "src/frappe/frappe-client";

dayjs.extend(utc);
dayjs.extend(timezone);

export default class MisscallNotificationService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.doctype = "Call Log";
    this.frappeClient = new FrappeClient({ env });
    this.chatId = CHAT_GROUPS.HOTLINE_GROUP.chat_id;
  }

  formatCard(callLog, agentText) {
    const formattedTime = callLog.start_time
      ? dayjs.utc(callLog.start_time).tz(TIMEZONE_VIETNAM).format("DD/MM/YYYY HH:mm:ss")
      : dayjs().tz(TIMEZONE_VIETNAM).format("DD/MM/YYYY HH:mm:ss");

    const erpBaseUrl = this.env.JEMMIA_ERP_BASE_URL.replace(/\/$/, "");
    const erpCallLogUrl = `${erpBaseUrl}/app/call-log/${callLog.name}`;
    const maskedPhoneNumber = callLog.from.replace(/\d(?=\d{5})/g, "*");
    const markdownLines = [
      `**Hotline tiếp nhận:** ${callLog.to}`,
      `**Thời gian gọi:** ${formattedTime}`,
      agentText ? `**Đã kết nối với nhân viên:** ${agentText}` : null
    ].filter(Boolean);

    return {
      config: { wide_screen_mode: true },
      card_link: {
        url: erpCallLogUrl,
        pc_url: erpCallLogUrl,
        ios_url: erpCallLogUrl,
        android_url: erpCallLogUrl
      },
      header: {
        template: "red",
        title: {
          content: `📞 Cuộc gọi nhỡ mới: ${maskedPhoneNumber}`,
          tag: "plain_text"
        }
      },
      elements: [
        {
          tag: "markdown",
          content: markdownLines.join("\n")
        },
        {
          tag: "action",
          actions: [
            {
              tag: "button",
              text: {
                content: "Xem trên ERP",
                tag: "plain_text"
              },
              type: "primary",
              url: erpCallLogUrl
            }
          ]
        }
      ]
    };
  }

  async notifyMisscalls(options = {}) {
    const { minutesBack = 10 } = options;
    const timeThreshold = dayjs()
      .utc()
      .subtract(minutesBack, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");

    const misscalls = await this.frappeClient.getList(this.doctype, {
      filters: [
        ["creation", ">=", timeThreshold],
        ["type", "=", "Incoming"],
        ["disposition", "in", ["noanswer", "misscall"]],
        ["message_id", "is", "not set"]
      ]
    });
    if (!misscalls?.length) return;

    const agentEmails = [...new Set(misscalls.map(c => c.agent).filter(Boolean))];
    const userTags = {};

    if (agentEmails?.length) {
      const users = await this.db.larksuite_users.findMany({
        where: {
          OR: [
            { enterprise_email: { in: agentEmails } },
            { email: { in: agentEmails } }
          ]
        },
        select: { enterprise_email: true, email: true, user_id: true }
      });

      users.forEach(u => {
        if (u.enterprise_email) userTags[u.enterprise_email] = `<at id="${u.user_id}"></at>`;
        if (u.email) userTags[u.email] = `<at id="${u.user_id}"></at>`;
      });
    }

    const larkClient = await LarksuiteService.createClientV2(this.env);
    for (const callLog of misscalls) {
      const agentText = callLog.agent
        ? (userTags[callLog.agent] || callLog.agent_name || callLog.agent)
        : (callLog.agent_name || null);

      const card = this.formatCard(callLog, agentText);
      const res = await retryRequest(() => larkClient.im.message.create({
        params: { receive_id_type: "chat_id" },
        data: {
          receive_id: this.chatId,
          msg_type: "interactive",
          content: JSON.stringify(card)
        }
      }));

      const message_id = res?.data?.message_id;
      if (message_id) {
        await this.frappeClient.update({
          doctype: this.doctype,
          name: callLog.name,
          message_id
        });
      }
    }
  }
}
