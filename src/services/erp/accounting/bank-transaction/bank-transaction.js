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

const EXCLUDED_TRANSACTION_PATTERNS = [
  "Nop tien mat",
  "Tra lai TK",
  "Rut tien mat",
  "noi bo",
  "MASTER:JEMMIA",
  "VISA:JEMMIA",
  "JCB:JEMMIA",
  "HTC",
  "HTC TRA COD",
  "Zalopay",
  "nop tien",
  "Payoo",
  "Tra lai tien gui",
  "Nhat Tin Thanh toan tien COD",
  "Hoan tam ung",
  "Chuyen tien noi bo",
  "Hoan ung",
  "Hoan tien tam ung"
];

const LOCATION_CC_RULES = [
  { pattern: "Hồ Chí Minh", label: "Hồ Chí Minh", email: "trinh.ngo@jemmia.vn" },
  { pattern: "Hà Nội", label: "Hà Nội", email: "hue.phan@jemmia.vn" },
  { pattern: "Cần Thơ", label: "Cần Thơ", email: "tien.chau@jemmia.vn" }
];

export default class BankTransactionService {
  constructor(env) {
    this.env = env;

    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });

    this.db = Database.instance(env);
  }

  async notifyUnlinkedBankTransactions(options = {}) {
    try {
      const nowICT = dayjs().tz(TIMEZONE_VIETNAM);
      const { fromDate, toDate } = options;

      let fromDateUTC, toDateUTC;

      if (fromDate && toDate) {
        fromDateUTC = dayjs(fromDate).utc().format("YYYY-MM-DD HH:mm:ss");
        toDateUTC = dayjs(toDate).utc().format("YYYY-MM-DD HH:mm:ss");
      } else {
        const oneDayAgoICT = nowICT.subtract(1, "day");
        fromDateUTC = oneDayAgoICT.utc().format("YYYY-MM-DD HH:mm:ss");
        toDateUTC = nowICT.utc().format("YYYY-MM-DD HH:mm:ss");
      }

      const filters = [
        ["creation", ">=", fromDateUTC],
        ["creation", "<=", toDateUTC],
        ["transaction_type", "=", "SePay"]
      ];

      EXCLUDED_TRANSACTION_PATTERNS.forEach(pattern => {
        filters.push(["sepay_transaction_content", "not like", `%${pattern}%`]);
      });

      const bankTransactions = await this.frappeClient.getList("Bank Transaction", {
        fields: ["name", "date", "deposit", "sepay_transaction_content", "bank_account", "sepay_transaction_date"],
        filters,
        limit_page_length: 100
      });

      if (!bankTransactions || bankTransactions.length === 0) {
        return [];
      }

      const unlinkedTransactions = [];
      for (const transaction of bankTransactions) {
        try {
          const fullTransaction = await this.frappeClient.getDoc("Bank Transaction", transaction.name);
          const hasPaymentEntry = fullTransaction.payment_entries &&
                                   Array.isArray(fullTransaction.payment_entries) &&
                                   fullTransaction.payment_entries.length > 0;

          if (!hasPaymentEntry) {
            unlinkedTransactions.push({
              name: transaction.name,
              date: transaction.date,
              amount_in: transaction.deposit,
              sepay_transaction_content: transaction.sepay_transaction_content,
              sepay_transaction_date: transaction.sepay_transaction_date,
              bank_account: transaction.bank_account
            });
          }
        } catch {
          // Skip failed transactions
        }
      }

      if (unlinkedTransactions.length > 0) {
        await this.sendNotification(unlinkedTransactions, dayjs(toDateUTC).tz(TIMEZONE_VIETNAM).format("YYYY-MM-DD"));
      }

      return unlinkedTransactions;
    } catch (error) {
      Sentry.captureException(error);
      return [];
    }
  }

  async getUserIdByEmail(email) {
    try {
      const user = await this.db.larksuite_users.findFirst({
        where: {
          OR: [
            { email: email },
            { enterprise_email: email }
          ]
        },
        select: {
          user_id: true
        }
      });

      return user?.user_id || null;
    } catch (error) {
      console.warn("Error fetching user by email from database:", error.message);
      Sentry.captureException(error);
      return null;
    }
  }

  async sendNotification(transactions, date) {
    const groupedTransactions = [];
    let remainingTransactions = [...transactions];

    for (const rule of LOCATION_CC_RULES) {
      const groupTransactions = remainingTransactions.filter(t => t.bank_account && t.bank_account.includes(rule.pattern));

      if (groupTransactions.length > 0) {
        const userId = await this.getUserIdByEmail(rule.email);
        groupedTransactions.push({
          label: rule.label,
          transactions: groupTransactions,
          userId
        });

        // Remove matches from remaining
        remainingTransactions = remainingTransactions.filter(t => !groupTransactions.includes(t));
      }
    }

    // Add remaining as "Others" if any
    if (remainingTransactions.length > 0) {
      groupedTransactions.push({
        label: "Khác",
        transactions: remainingTransactions,
        userId: null
      });
    }

    const message = this.formatNotificationMessage(groupedTransactions, transactions.length, date);
    const larkClient = await LarksuiteService.createClientV2(this.env);

    await larkClient.im.message.create({
      params: {
        receive_id_type: "chat_id"
      },
      data: {
        receive_id: CHAT_GROUPS.BANK_TRANSACTION_NOTIFICATION.chat_id,
        msg_type: "text",
        content: JSON.stringify({
          text: message
        })
      }
    });
  }

  formatNotificationMessage(groupedTransactions, totalCount, date) {
    const formattedHeaderDate = dayjs(date).format("DD-MM-YYYY");
    let message = `⚠️ [${formattedHeaderDate}] Có ${totalCount} giao dịch chưa được liên kết với phiếu thu ⚠️:\n` +
      "Lý do: Không thể tự động tìm thấy phiếu thu để gắn giao dịch. Vui lòng tìm và tự gắn lại\n";

    let globalIndex = 0;

    for (const group of groupedTransactions) {
      message += "\n";
      message += `📍 <b>KHU VỰC: ${group.label.toUpperCase()}</b>\n`;

      const groupList = group.transactions.map(transaction => {
        globalIndex++;
        const link = `https://erp.jemmia.vn/app/bank-transaction/${transaction.name}`;
        const amount = new Intl.NumberFormat("vi-VN").format(transaction.amount_in || 0);
        const formattedDate = transaction.sepay_transaction_date
          ? dayjs(transaction.sepay_transaction_date).format("DD-MM-YYYY HH:mm:ss")
          : dayjs(transaction.date).format("DD-MM-YYYY");

        return `\n${globalIndex}. Giao dịch ${transaction.name}\n` +
               `- Tiền vào: +${amount} ₫\n` +
               `- Tài khoản: ${transaction.bank_account || "N/A"}\n` +
               `- Lúc: ${formattedDate}\n` +
               `- Nội dung CK: ${transaction.sepay_transaction_content || "N/A"}\n` +
               `- Link: ${link}`;
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

  static async notifyUnlinkedBankTransactions(env, options = {}) {
    const service = new BankTransactionService(env);
    return await service.notifyUnlinkedBankTransactions(options);
  }
}
