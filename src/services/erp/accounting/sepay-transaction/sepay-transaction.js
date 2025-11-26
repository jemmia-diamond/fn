import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { TABLES } from "services/larksuite/docs/constant";
import RecordService from "services/larksuite/docs/base/record/record";
import HaravanAPI from "services/clients/haravan-client";
import { BadRequestException } from "src/exception/exceptions";

dayjs.extend(utc);

export default class SepayTransactionService {
  constructor(env) {
    this.env = env;

    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });

    this.db = Database.instance(env);
  }

  async processTransaction(sepayTransaction) {
    const { content, transferAmount } = sepayTransaction;

    const { orderNumber, orderDesc } = this.standardizeOrderNumber(content);

    if (!orderNumber && !orderDesc) {
      if (!match) throw new Error("Order description not found");
    }

    const isOrderLater = orderNumber === "ORDERLATER";

    const qr = await this.findQrRecord({
      orderNumber,
      orderDesc,
      transferAmount
    });

    if (!qr) throw new Error("QR code not found");

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    if (!isOrderLater) {
      const hrvClient = new HaravanAPI(HRV_API_KEY);

      const created = await hrvClient.orderTransaction.createTransaction(
        qr.haravan_order_id,
        {
          amount: transferAmount,
          kind: "capture",
          gateway: "Chuyển khoản ngân hàng (tự động xác nhận giao dịch)"
        }
      );

      if (!created) {
        throw new Error("Failed to create Haravan transaction");
      }
    }

    await this.db.qrPaymentTransaction.update({
      where: { id: qr.id },
      data: { transfer_status: "success" }
    });

    if (qr.payment_entry_name) {
      await this.frappeClient.upsert(
        {
          doctype: "Payment Entry",
          name: qr.payment_entry_name,
          custom_transfer_status: "success"
        },
        "name"
      );
    }

    if (qr.lark_record_id) {
      const fieldsToUpdate = {
        ["Trạng thái chuyển khoản"]: "Đã hoàn thành"
      };
      await RecordService.updateLarksuiteRecord({
        env: this.env,
        appToken: TABLES.QR_PAYMENT.app_token,
        tableId: TABLES.QR_PAYMENT.table_id,
        recordId: qr.lark_record_id,
        fields: fieldsToUpdate,
        userIdType: "open_id"
      });
    }
    return true;
  }

  standardizeOrderNumber(content) {
    if (!content) {
      return { orderNumber: null, orderDesc: null };
    }
    const pattern = /(?:SEVQR\s+)?(ORDER\w+(?:\s+\d+)?|ORDERLATER(?:\s+\d+)?)/;
    const match = content.match(pattern);
    if (!match) {
      return { orderNumber: null, orderDesc: null };
    }

    const orderDesc = match[0];
    const parts = orderDesc.split(" ");
    const orderNumber = parts[0] === "SEVQR" ? parts[1] : parts[0];

    return { orderNumber, orderDesc };
  }

  mapRawSepayTransactionToPrisma(rawSepayTransaction) {
    return {
      id: String(rawSepayTransaction.id),
      bank_brand_name: rawSepayTransaction.gateway,
      account_number: rawSepayTransaction.accountNumber,
      transaction_date: rawSepayTransaction.transactionDate,
      amount_out: String(rawSepayTransaction.amountOut ?? 0.0),
      amount_in: String(rawSepayTransaction.transferAmount ?? 0.0),
      accumulated: String(rawSepayTransaction.accumulated),
      transaction_content: rawSepayTransaction.content,
      reference_number: rawSepayTransaction.referenceCode,
      code: rawSepayTransaction.code,
      sub_account: rawSepayTransaction.subAccount,
      bank_account_id: null
    };
  }

  async sendToLark(rawSepayTransaction) {

    const sepayTransaction = this.mapRawSepayTransactionToPrisma(rawSepayTransaction);

    if (parseFloat(sepayTransaction.amount_in) < 0) return;

    const { orderNumber, orderDesc } = this.standardizeOrderNumber(sepayTransaction.transaction_content);

    const fields = {
      "Số Tiền Giao Dịch": Number(sepayTransaction.amount_in),
      "Sepay - Nội dung giao dịch": sepayTransaction.transaction_content,
      "Sepay - ID Giao Dịch": sepayTransaction.id,
      "Sepay - Mã Đơn Từ Giao Dịch": orderNumber,
      "Sepay - Nội Dung Đơn Từ Giao Dịch": orderDesc,
      "Ngày Nhận Tiền": dayjs(sepayTransaction.transaction_date, "YYYY-MM-DD HH:mm:ss").valueOf(),
      "Ngân Hàng": sepayTransaction.bank_brand_name,
      "Số Tài Khoản": sepayTransaction.account_number
    };

    const larkParams = {
      env: this.env,
      appToken: TABLES.SEPAY_TRANSACTION.app_token,
      tableId: TABLES.SEPAY_TRANSACTION.table_id,
      userIdType: "open_id"
    };

    const existingTransaction = await this.db.sepay_transaction.findUnique({
      where: { id: sepayTransaction.id }
    });

    let upsertedLarkRecord = null;
    if (existingTransaction && existingTransaction.lark_record_id) {
      upsertedLarkRecord = await RecordService.updateLarksuiteRecord({
        ...larkParams,
        recordId: existingTransaction.lark_record_id,
        fields
      });
    } else {
      upsertedLarkRecord = await RecordService.createLarksuiteRecord({
        ...larkParams,
        fields
      });
    }
    if (upsertedLarkRecord && upsertedLarkRecord.id) {
      await this.db.sepay_transaction.update({
        where: { id: existingTransaction.id },
        data: { lark_record_id: upsertedLarkRecord.id }
      });
    }
  }

  async saveToDb(rawSepayTransaction) {

    const sepayTransaction = this.mapRawSepayTransactionToPrisma(rawSepayTransaction);

    if (parseFloat(sepayTransaction.amount_in) < 0) return;
    const {
      id,
      bank_brand_name,
      account_number,
      transaction_date,
      amount_out,
      amount_in,
      accumulated,
      transaction_content,
      reference_number,
      code,
      sub_account,
      bank_account_id
    } = sepayTransaction;

    try {
      const upsertedTransaction = await this.db.sepay_transaction.upsert({
        where: { id },
        update: {
          bank_brand_name,
          account_number,
          transaction_date,
          amount_out,
          amount_in,
          accumulated,
          transaction_content,
          reference_number,
          code,
          sub_account,
          bank_account_id,
          updated_at: new Date()
        },
        create: sepayTransaction
      });

      if (!upsertedTransaction) {
        throw new Error("Failed to save Sepay transaction to database");
      }

      return upsertedTransaction;
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }

  async findQrRecord({ orderNumber, orderDesc, transferAmount }) {
    return this.db.qrPaymentTransaction.findFirst({
      where: {
        haravan_order_number: orderNumber,
        transfer_note: orderDesc,
        transfer_amount: transferAmount,
        transfer_status: "pending",
        is_deleted: false
      }
    });
  }

  static async dequeueSepayTransactionQueue(batch, env) {
    const service = new SepayTransactionService(env);

    for (const message of batch.messages) {
      try {
        await service.processTransaction(message.body);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  static async dequeueSaveToDb(batch, env) {
    const service = new SepayTransactionService(env);

    for (const message of batch.messages) {
      try {
        await service.saveToDb(message.body);
        await service.sendToLark(message.body);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
