import FrappeClient from "src/frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import * as Sentry from "@sentry/cloudflare";
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import Database from "services/database";
import { TIMEZONE_VIETNAM } from "src/constants";

dayjs.extend(utc);
dayjs.extend(timezone);

const BRANCH_MANAGERS = [
  { pattern: "Cửa hàng HCM", label: "Hồ Chí Minh", email: "trinh.ngo@jemmia.vn" },
  { pattern: "Cửa hàng Hà Nội", label: "Hà Nội", email: "hue.phan@jemmia.vn" },
  { pattern: "Cửa hàng Cần Thơ", label: "Cần Thơ", email: "tien.chau@jemmia.vn" }
];
const PAGE_LIMIT = 100;
const ZERO = 0;
const DRAFT_RECORD = 0;

export default class PaymentEntryNotificationService {
  constructor(env) {
    this.env = env;
    this.erpPEUrl = `${env.JEMMIA_ERP_BASE_URL}/app/payment-entry`;
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });

    this.db = Database.instance(env);
  }

  async runMorningBatch() {
    const now = dayjs().utc();
    const startDate = now.subtract(1, "day").hour(10).minute(0).second(0);
    return await this._notifyForDateRange(startDate.toDate(), now.toDate());
  }

  async runAfternoonBatch() {
    const now = dayjs().utc();
    const startDate = now.hour(2).minute(0).second(0);
    return await this._notifyForDateRange(startDate.toDate(), now.toDate());
  }

  async _notifyForDateRange(startDate, endDate) {
    try {
      const start = dayjs(startDate).utc();
      const end = dayjs(endDate).utc();

      const filters = [
        ["creation", ">=", start],
        ["creation", "<=", end],
        ["custom_transfer_status", "in", ["pending", "success"]],
        ["payment_order_status", "in", ["Pending", "Success"]],
        ["docstatus", "=", DRAFT_RECORD]
      ];

      const paymentEntries = await this.frappeClient.getList("Payment Entry", {
        fields: [
          "name",
          "payment_date",
          "paid_amount",
          "party_name",
          "mode_of_payment",
          "payment_code",
          "bank_account_branch",
          "custom_transfer_status",
          "payment_order_status",
          "gateway"
        ], filters, limit_page_length: PAGE_LIMIT
      });

      const entriesWithoutReferences = [];
      for (const entry of paymentEntries) {
        const fullEntry = await this.frappeClient.getDoc("Payment Entry", entry.name);
        const hasReferences = fullEntry?.references?.length > ZERO;
        if (!hasReferences) entriesWithoutReferences.push(entry);
      }

      if (entriesWithoutReferences.length === 0) return [];

      const pendingEntries = entriesWithoutReferences.map(entry => ({
        name: entry.name,
        payment_date: entry.payment_date,
        amount: entry.paid_amount,
        party_name: entry.party_name,
        mode_of_payment: entry.mode_of_payment,
        payment_code: entry.payment_code,
        branch: entry.bank_account_branch,
        custom_transfer_status: entry.custom_transfer_status,
        payment_order_status: entry.payment_order_status,
        gateway: entry.gateway
      }));

      if (pendingEntries.length > ZERO) {
        await this.sendNotification(pendingEntries, end.tz(TIMEZONE_VIETNAM).format("YYYY-MM-DD"));
      }

      return pendingEntries;
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  async getUserIdByEmail(email) {
    const user = await this.db.larksuite_users.findFirst({
      where: { OR: [{ email }, { enterprise_email: email }] },
      select: { user_id: true }
    });

    return user?.user_id || null;
  }

  async sendNotification(entries, date) {
    const groupedEntries = [];
    let remainingEntries = [...entries];

    for (const rule of BRANCH_MANAGERS) {
      const groupEntries = remainingEntries.filter(e => e.branch && e.branch.includes(rule.pattern));

      if (groupEntries.length > ZERO) {
        const userId = await this.getUserIdByEmail(rule.email);
        groupedEntries.push({
          label: rule.label,
          entries: groupEntries,
          userId
        });

        remainingEntries = remainingEntries.filter(e => !groupEntries.includes(e));
      }
    }

    if (remainingEntries.length > ZERO) {
      groupedEntries.push({
        label: "Khác",
        entries: remainingEntries,
        userId: null
      });
    }

    const message = this.formatNotificationMessage(groupedEntries, entries.length, date);
    const larkClient = await LarksuiteService.createClientV2(this.env);

    await larkClient.im.message.create({
      params: { receive_id_type: "chat_id" },
      data: {
        receive_id: CHAT_GROUPS.BANK_TRANSACTION_NOTIFICATION.chat_id,
        msg_type: "text",
        content: JSON.stringify({ text: message })
      }
    });
  }

  formatNotificationMessage(groupedEntries, totalCount, date) {
    const formattedHeaderDate = dayjs(date).format("DD-MM-YYYY");
    let message = `[${formattedHeaderDate}] Có ${totalCount} phiếu thanh toán đang chờ xử lý:\n` +
      "Lý do: <b> Phiếu thanh toán chưa được map đơn</b>. Vui lòng kiểm tra và xử lý\n";
    let globalIndex = ZERO;
    for (const group of groupedEntries) {
      message += "\n";
      message += `<b>KHU VỰC: ${group.label.toUpperCase()}</b>\n`;

      const groupList = group.entries.map(entry => {
        globalIndex++;
        const link = `${this.erpPEUrl}/${entry.name}`;
        const formattedAmount = new Intl.NumberFormat("vi-VN").format(entry.amount || ZERO);

        return `\n${globalIndex}. Phiếu ${entry.name}\n` +
               `- Số tiền: ${formattedAmount}\n` +
               `- Loại thanh toán: ${entry.mode_of_payment}\n` +
              (entry.payment_code !== "banking" ? `- Kênh thanh toán: ${entry.gateway}\n` : "") +
               `- Khách hàng: ${entry?.party_name}\n` +
               `- Link: <b>${link}</b>`;
      }).join("\n");

      message += groupList;
      if (group.userId) {
        message += `\n\n<at user_id="${group.userId}"></at>\n`;
      } else {
        message += "\n";
      }
    }
    return message;
  }
}
