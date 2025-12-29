import FrappeClient from "src/frappe/frappe-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import * as Sentry from "@sentry/cloudflare";
import LarksuiteService from "services/larksuite/lark";
import { CHAT_GROUPS } from "services/larksuite/group-chat/group-management/constant";
import Database from "services/database";

dayjs.extend(utc);
dayjs.extend(timezone);

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

  async syncUnlinkedBankTransactions() {
    try {
      const nowICT = dayjs().tz("Asia/Bangkok");
      const oneDayAgoICT = nowICT.subtract(1, "day");

      const nowUTC = nowICT.utc().format("YYYY-MM-DD HH:mm:ss");
      const oneDayAgoUTC = oneDayAgoICT.utc().format("YYYY-MM-DD HH:mm:ss");

      const filters = [
        ["creation", ">=", oneDayAgoUTC],
        ["creation", "<=", nowUTC]
      ];

      const excludedPatterns = this.env.BANK_TRANSACTION_EXCLUDED_PATTERNS
        ? this.env.BANK_TRANSACTION_EXCLUDED_PATTERNS.split(",")
        : [];

      excludedPatterns.forEach(pattern => {
        filters.push(["sepay_transaction_content", "not like", `%${pattern.trim()}%`]);
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
        await this.sendNotification(unlinkedTransactions, nowICT.format("YYYY-MM-DD"));
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
    const recipientEmail = this.env.BANK_TRANSACTION_NOTIFICATION_EMAIL;

    let userId = null;
    if (recipientEmail && recipientEmail.trim()) {
      userId = await this.getUserIdByEmail(recipientEmail);
    }

    const message = this.formatNotificationMessage(transactions, date, userId);
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

  formatNotificationMessage(transactions, date, userId = null) {
    const formattedHeaderDate = dayjs(date).format("DD-MM-YYYY");
    const header = `⚠️ [${formattedHeaderDate}] Có ${transactions.length} giao dịch chưa được liên kết với phiếu thu ⚠️:\n`;

    const transactionList = transactions.map((transaction, index) => {
      const link = `https://erp.jemmia.vn/app/bank-transaction/${transaction.name}`;
      const amount = new Intl.NumberFormat("vi-VN").format(transaction.amount_in || 0);
      const formattedDate = transaction.sepay_transaction_date
        ? dayjs(transaction.sepay_transaction_date).format("DD-MM-YYYY HH:mm:ss")
        : dayjs(transaction.date).format("DD-MM-YYYY");

      return `\n${index + 1}. Giao dịch ${transaction.name}\n` +
             `- Tiền vào: +${amount} ₫\n` +
             `- Tài khoản: ${transaction.bank_account || "N/A"}\n` +
             `- Lúc: ${formattedDate}\n` +
             `- Nội dung CK: ${transaction.sepay_transaction_content || "N/A"}\n` +
             `- Link: ${link}`;
    }).join("\n");

    const mention = userId ? `\n\n<at user_id="${userId}"></at>` : "";
    return header + transactionList + mention;
  }

  static async syncUnlinkedBankTransactions(env) {
    const service = new BankTransactionService(env);
    return await service.syncUnlinkedBankTransactions();
  }
}
