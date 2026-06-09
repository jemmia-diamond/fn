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

    const count = orders.length;
    const stats = await this._getBranchStatsAndTags(orders);

    const message = stringSquishLarkMessage(`
      Jemmia Bot vừa cập nhật danh sách công nợ tuần này. Hiện có **${count}** đơn hàng cần cập nhật tình trạng thu tiền:

      TP.HCM: **${stats.hcmCount}** đơn — ${stats.hcmTag}
      Hà Nội: **${stats.hnCount}** đơn — ${stats.hnTag}
      Cần Thơ: **${stats.ctCount}** đơn — ${stats.ctTag}
      Khác: **${stats.otherCount}** đơn — ${stats.allTags}

      Các chị vào ERP cập nhật giúp Bot nhé!
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

    const stats = await this._getBranchStatsAndTags(orders);

    const message = stringSquishLarkMessage(`
      ⏰ Hôm nay còn **${remainingOrders}** đơn chưa được cập nhật. Các chị hoàn thành trước **14:00** giúp Bot nha, để kịp tổng hợp báo cáo cuối ngày!

      TP.HCM: **${stats.hcmCount}** đơn — ${stats.hcmTag}
      Hà Nội: **${stats.hnCount}** đơn — ${stats.hnTag}
      Cần Thơ: **${stats.ctCount}** đơn — ${stats.ctTag}
      Khác: **${stats.otherCount}** đơn — ${stats.allTags}
    `);

    await this._sendToLarksuite(message, {
      text: "👉 Kiểm tra đơn hàng trên ERP",
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

  async _getBranchStatsAndTags(orders) {
    let hcmCount = 0;
    let hnCount = 0;
    let ctCount = 0;
    let otherCount = 0;

    orders.forEach(order => {
      const address = order.billing_address || "";
      if (address.includes("72 Nguyễn Cư Trinh")) hcmCount++;
      else if (address.includes("63 Kim Mã")) hnCount++;
      else if (address.includes("209 Đường 30 Tháng 4")) ctCount++;
      else otherCount++;
    });

    const adminEmails = ["trinh.ngo@jemmia.vn", "hue.phan@jemmia.vn", "tien.chau@jemmia.vn"];
    const users = await this.db.larksuite_users.findMany({
      where: { enterprise_email: { in: adminEmails } },
      select: { enterprise_email: true, user_id: true }
    });

    const adminTags = {};
    users.forEach(u => { adminTags[u.enterprise_email] = `<at id="${u.user_id}"></at>`; });

    const hcmTag = adminTags["trinh.ngo@jemmia.vn"];
    const hnTag = adminTags["hue.phan@jemmia.vn"];
    const ctTag = adminTags["tien.chau@jemmia.vn"];
    const allTags = `${hcmTag} ${hnTag} ${ctTag}`;

    return {
      hcmCount, hnCount, ctCount, otherCount,
      hcmTag, hnTag, ctTag, allTags
    };
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
