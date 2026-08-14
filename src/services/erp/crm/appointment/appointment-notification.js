import LarksuiteService, { LARK_WIKI_URL } from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import { APPOINTMENTS } from "services/larksuite/appointment/constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { TIMEZONE_VIETNAM } from "src/constants";
import Database from "services/database";

dayjs.extend(utc);
dayjs.extend(timezone);

export default class AppointmentNotificationService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.larkClientPromise = LarksuiteService.createClientV2(env);
  }

  async sendNewAppointmentMessage(payload, fields) {
    const larkClient = await this.larkClientPromise;
    let templateColor = "blue";
    let titleContent = "Có lịch hẹn mới";
    if (payload.scheduled_time) {
      const scheduledDate = dayjs.utc(payload.scheduled_time).tz(TIMEZONE_VIETNAM).startOf("day");
      const today = dayjs().tz(TIMEZONE_VIETNAM).startOf("day");
      if (scheduledDate.isBefore(today)) {
        templateColor = "red";
        titleContent = `Bổ sung lịch hẹn ${payload.name}`;
      } else if (scheduledDate.isSame(today)) {
        templateColor = "orange";
        titleContent = `Có lịch hẹn hôm nay ${payload.name}`;
      } else {
        templateColor = "blue";
        titleContent = `Có lịch hẹn mới ${payload.name}`;
      }
    }
    const markdownContent = [
      `**Khách hàng:** ${payload.customer_name}`,
      `**Thời gian dự kiến:** ${dayjs(payload.scheduled_time).add(7, "hours").format("DD/MM/YYYY HH:mm:ss")}`,
      `**Cửa hàng:** ${payload.store}`,
      `**Mục đích cuộc hẹn:** ${payload.appointment_reason}`,
      `**Người tạo:** <at user_id="${fields["Người tạo"]?.[0]?.id}"></at>`
    ].join("\n");

    const card = {
      config: { wide_screen_mode: true },
      card_link: {
        url: `${this.env.JEMMIA_ERP_BASE_URL}/app/appointment/${payload.name}`,
        pc_url: `${this.env.JEMMIA_ERP_BASE_URL}/app/appointment/${payload.name}`,
        ios_url: `${this.env.JEMMIA_ERP_BASE_URL}/app/appointment/${payload.name}`,
        android_url: `${this.env.JEMMIA_ERP_BASE_URL}/app/appointment/${payload.name}`
      },
      header: {
        template: templateColor,
        title: {
          content: titleContent,
          tag: "plain_text"
        }
      },
      elements: [
        {
          tag: "markdown",
          content: markdownContent
        },
        {
          tag: "action",
          actions: [
            {
              tag: "button",
              text: {
                content: "Xem chi tiết ERP",
                tag: "plain_text"
              },
              type: "primary",
              url: `${this.env.JEMMIA_ERP_BASE_URL}/app/appointment/${payload.name}`
            },
            {
              tag: "button",
              text: {
                content: "Xem Record",
                tag: "plain_text"
              },
              type: "default",
              url: `${LARK_WIKI_URL}/${APPOINTMENTS.APP_TOKEN}?table=${APPOINTMENTS.TABLE_ID}&record=${payload.record_id}&ccm_open_type=im_card_automation_button`
            }
          ]
        }
      ]
    };

    const res = await larkClient.im.message.create({
      params: { receive_id_type: "chat_id" },
      data: {
        receive_id: CHAT_GROUPS.CUSTOMER_VISITING_GROUP.chat_id,
        msg_type: "interactive",
        content: JSON.stringify(card)
      }
    });
    return res.data?.message_id;
  }

  async sendThreadReply(message_id, payload, existingFields) {
    if (["tech@jemmia.vn", "Administrator"].includes(payload.performed_by)) return;

    const larkClient = await this.larkClientPromise;
    let modifiedByText = "ai đó";
    if (payload.performed_by) {
      const userIds = await this.getLarkUserIdsByEmails([payload.performed_by]);
      if (userIds && userIds.length > 0) {
        modifiedByText = `<at user_id="${userIds[0].id}"></at>`;
      } else {
        modifiedByText = payload.performed_by;
      }
    }

    let textContent = `Trạng thái: <b>${payload.status}</b>\n`;
    if (existingFields) {
      const oldTimeMs = existingFields["Ngày đến dự kiến"];
      const newTimeMs = payload.scheduled_time ? new Date(payload.scheduled_time).getTime() : null;
      if (oldTimeMs != newTimeMs) {
        const oldTimeStr = oldTimeMs ? dayjs(parseInt(oldTimeMs)).add(7, "hours").format("DD-MM-YYYY HH:mm") : "N/A";
        const newTimeStr = newTimeMs ? dayjs(newTimeMs).add(7, "hours").format("DD-MM-YYYY HH:mm") : "N/A";
        textContent += `Thời gian dự kiến: ${oldTimeStr}  ➡️  ${newTimeStr}\n`;
      }
    }

    const offlineSalesEmails = (payload?.offline_sales || []).map(s => s.employee_email).filter(Boolean);
    let salesChanged = false;
    let offlineSalesTagsStr = "";

    if (offlineSalesEmails.length > 0) {
      const offlineIds = await this.getLarkUserIdsByEmails(offlineSalesEmails);
      if (offlineIds.length > 0) {
        offlineSalesTagsStr = offlineIds.map(u => `<at user_id="${u.id}"></at>`).join(", ");

        if (existingFields) {
          const existingSales = (existingFields["Sales hỗ trợ"] || []).map(u => u.id).sort().join(",");
          const newSales = offlineIds.map(u => u.id).sort().join(",");
          if (existingSales !== newSales) salesChanged = true;
        } else {
          salesChanged = true;
        }
      }
    } else {
      if (existingFields && (existingFields["Sales hỗ trợ"] || []).length > 0) {
        salesChanged = true;
        offlineSalesTagsStr = "Trống";
      }
    }

    if (salesChanged && offlineSalesTagsStr) {
      textContent += `Sales hỗ trợ: ${offlineSalesTagsStr}\n`;
    }
    textContent += `\nCập nhật bởi: ${modifiedByText}`;

    const content = JSON.stringify({
      text: textContent
    });

    await larkClient.im.message.reply({
      path: { message_id: message_id },
      data: {
        content: content,
        msg_type: "text",
        reply_in_thread: true
      }
    });
  }

  async getLarkUserIdsByEmails(emails) {
    if (!emails?.length) return [];

    const users = await this.db.larksuite_users.findMany({
      where: { enterprise_email: { in: emails } },
      select: { open_id: true }
    });
    return users.filter(u => u.open_id).map(u => ({ id: u.open_id }));
  }

  shouldSendThreadReply(existingFields, fields) {
    if (!existingFields) return true;

    const existingTime = existingFields["Ngày đến dự kiến"];
    const newTime = fields["Ngày đến dự kiến"];
    if (existingTime != newTime) return true;

    const existingStatus = existingFields["Trạng thái"];
    const newStatus = fields["Trạng thái"];
    if (existingStatus != newStatus) return true;

    const existingSales = (existingFields["Sales hỗ trợ"] || []).map(u => u.id).sort().join(",");
    const newSales = (fields["Sales hỗ trợ"] || []).map(u => u.id).sort().join(",");
    if (existingSales !== newSales) return true;

    return false;
  }

  async sendUpcomingReminder(payload) {
    if (!payload?.message_id) return;

    const timeStr = dayjs(payload.scheduled_time).add(7, "hours").format("HH:mm");
    const textContent = `⚠️ Nhắc lịch: Khách hàng ${payload?.customer_name} chuẩn bị đến vào lúc ${timeStr}.`;

    await this.larkClientPromise.im.message.reply({
      path: { message_id: payload.message_id },
      data: {
        content: JSON.stringify({ text: textContent }),
        msg_type: "text",
        reply_in_thread: true
      }
    });
  }
}
