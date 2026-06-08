import FrappeClient from "src/frappe/frappe-client";
import Database from "services/database";
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { TIMEZONE_VIETNAM } from "src/constants";
import { stringSquishLarkMessage } from "services/utils/string-helper";

dayjs.extend(utc);
dayjs.extend(timezone);

const SPECIFIC_SALES_ADMIN = [
  "tien.chau@jemmia.vn",
  "trinh.ngo@jemmia.vn",
  "thao.nguyen@jemmia.vn",
  "hue.phan@jemmia.vn"
];
const VIETNAM_THURSDAY = 4;

export default class DebtTrackingNotificationService {
  constructor(env) {
    this.env = env;
    this.erpBaseUrl = env.JEMMIA_ERP_BASE_URL.replace(/\/$/, "");
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
    this.db = Database.instance(env);
  }

  /**
   * 09:30 AM (GMT+7 Thursday) - Weekly Debt Notification
   */
  async notifyWeeklyAnnouncement() {
    if (dayjs().tz(TIMEZONE_VIETNAM).day() !== VIETNAM_THURSDAY) return;

    const nextWednesday = dayjs().tz(TIMEZONE_VIETNAM).add(6, "day").format("YYYY-MM-DD");
    const orders = await this._fetchDebtList(nextWednesday, false);
    if (!orders?.length) return;

    const dynamicAdmins = orders.map(o => o.sales_person || o.owner).filter(Boolean);
    const salesAdmins = [...new Set([...dynamicAdmins, ...SPECIFIC_SALES_ADMIN])];
    const larkTags = await this._getLarkTagsForUsers(salesAdmins);

    const count = orders.length;
    const tagString = larkTags?.length ? `${larkTags.join(" ")}\n` : "";

    const message = stringSquishLarkMessage(`
      ${tagString}
      Jemmia Bot đã cập nhật danh sách công nợ tuần này,
      các chị vào ERP cập nhật tình hình thu công nợ giúp Bot nha.

      Có tổng cộng **${count}** đơn hàng cần check.
    `);

    await this._sendToLarksuite(message, {
      text: "👉 Kiểm tra đơn hàng trên ERP",
      url: `${this.erpBaseUrl}/desk/admin`
    });
  }

  /**
   * 11:30 AM (Thursday) - Unchecked Orders Reminder
   */
  async notifyUncheckedOrdersReminder() {
    if (dayjs().tz(TIMEZONE_VIETNAM).day() !== VIETNAM_THURSDAY) return;

    const orders = await this._fetchDebtList(null, true);
    const remainingOrders = orders?.length;
    if (!remainingOrders) return;

    const message = stringSquishLarkMessage(`
      Hôm nay còn **${remainingOrders}** đơn chưa cập nhật.
      Mời các admin vào trang Admin để kiểm tra và cập nhật nhé!
    `);

    await this._sendToLarksuite(message, {
      text: "👉 Trang Admin",
      url: `${this.erpBaseUrl}/desk/admin`
    });
  }

  async _fetchDebtList(fromDate, fromTheLastCheck) {
    const payload = {
      cmd: "erpnext.selling.doctype.order_and_debt_tracking.custom.services.get_debt_list",
      from_the_last_check: fromTheLastCheck
    };
    if (fromDate) payload.from_date = fromDate;

    const res = await this.frappeClient.postRequest("", payload);
    return res?.data;
  }

  async _getLarkTagsForUsers(userIdentifiers) {
    if (!userIdentifiers?.length) return [];

    const users = await this.db.larksuite_users.findMany({
      where: { enterprise_email: { in: userIdentifiers } },
      select: { user_id: true }
    });

    return users.filter(u => u.user_id).map(u => `<at id="${u.user_id}"></at>`);
  }

  async _sendToLarksuite(messageText, buttonConfig = null) {
    const elements = [
      {
        tag: "div",
        text: {
          content: messageText,
          tag: "lark_md"
        }
      },
      {
        tag: "action",
        actions: [
          {
            tag: "button",
            text: {
              content: buttonConfig.text,
              tag: "plain_text"
            },
            type: "primary",
            url: buttonConfig.url
          }
        ]
      }
    ];

    const larkClient = await LarksuiteService.createClientV2(this.env);
    await larkClient.im.message.create({
      params: { receive_id_type: "chat_id" },
      data: {
        receive_id: CHAT_GROUPS.ACCOUNTS_RECEIVABLE.chat_id,
        msg_type: "interactive",
        content: JSON.stringify({ elements })
      }
    });
  }
}
