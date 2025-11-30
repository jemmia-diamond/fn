import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import { TABLES } from "services/larksuite/docs/constant";
import RecordService from "services/larksuite/docs/base/record/record";
import HaravanAPI from "services/clients/haravan-client";
import Misa from "services/misa";
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

  /**
   * Process a Sepay transaction
   * 1. For Larksuite, we directly update status and create haravan transaction
   * 2. For ERPNext, we just need to link payment entry to bank transaction.
   * After that, another webhook will be triggered when payment entry is attached to bank transaction and update static + create haravan transaction
   * Make sure sepay transaction is synced to ERPNext before processing
   * @param {*} sepayTransaction
   * @returns {Promise<boolean>}
   */
  async processTransaction(sepayTransaction) {
    const { content, transferAmount } = sepayTransaction;

    const { orderNumber, orderDesc } = this.standardizeOrderNumber(content);

    if (!orderNumber && !orderDesc) {
      throw new Error("Order description not found");
    }

    const isOrderLater = orderNumber === "ORDERLATER";

    const qr = await this.findQrRecord({
      orderNumber,
      orderDesc,
      transferAmount
    });

    if (!qr) throw new Error("QR code not found");

    if (qr.payment_entry_name) {
      const bankTransactions = await this.frappeClient.getList("Bank Transaction", {
        filters: [["sepay_id", "=", sepayTransaction.id]],
        fields: ["name"]
      });

      const bankTransactionName = bankTransactions && bankTransactions.length > 0 ? bankTransactions[0].name : null;

      if (!bankTransactionName) {
        throw new Error("Bank Transaction not found in ERPNext");
      }

      const linkPaymentEntryToBankTransactionResult = await this.linkPaymentEntryToBankTransaction({
        paymentEntryName: qr.payment_entry_name,
        bankTransactionName: bankTransactionName
      });

      return linkPaymentEntryToBankTransactionResult;
    }

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

    if (qr.transfer_status === "success" && !isOrderLater && qr.haravan_order_id) {
      await this.enqueueMisaBackgroundJob(qr);
    }
    return true;
  }

  async linkPaymentEntryToBankTransaction({
    paymentEntryName,
    bankTransactionName
  }) {
    try {
      const bankTransaction = await this.frappeClient.getDoc("Bank Transaction", bankTransactionName);

      if (!bankTransaction) {
        throw new Error(`Bank Transaction ${bankTransactionName} not found`);
      }

      const paymentEntries = bankTransaction.payment_entries || [];
      const isAlreadyLinked = paymentEntries.some(
        (entry) => entry.payment_entry === paymentEntryName
      );

      if (!isAlreadyLinked) {
        // Assume we allocate the full unallocated amount or deposit if unallocated is not set/zero but it should be valid
        const amountToAllocate = bankTransaction.unallocated_amount > 0 ? bankTransaction.unallocated_amount : bankTransaction.deposit;

        paymentEntries.push({
          payment_entry: paymentEntryName,
          allocated_amount: amountToAllocate
        });

        await this.frappeClient.update({
          doctype: "Bank Transaction",
          name: bankTransactionName,
          payment_entries: paymentEntries
        });
      }
      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
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

  async sendToLark(rawSepayTransaction, existingTransaction) {
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

  async sendToERP(rawSepayTransaction, existingTransaction) {
    try {
      const sepayTransaction = this.mapRawSepayTransactionToPrisma(rawSepayTransaction);

      if (parseFloat(sepayTransaction.amount_in) < 0) return;

      const { orderNumber, orderDesc } = this.standardizeOrderNumber(sepayTransaction.transaction_content);

      if (existingTransaction) {
        const bank = sepayTransaction.bank_brand_name && await this.frappeClient.getList(
          "Bank",
          { filters: [["bank_name", "=", sepayTransaction.bank_brand_name]] }
        );
        const bankAccount = bank && bank[0] && sepayTransaction.account_number && await this.frappeClient.getList(
          "Bank Account",
          {
            filters: [
              ["bank", "=", bank[0].name],
              ["bank_account_no", "=", sepayTransaction.account_number]
            ]
          }
        );
        const upsertedBankTransaction = await this.frappeClient.upsert(
          {
            doctype: "Bank Transaction",
            name: existingTransaction.bank_transaction_name ?? "",
            sepay_id: sepayTransaction.id,
            sepay_order_number: orderNumber,
            sepay_order_description: orderDesc,
            sepay_bank_brand_name: sepayTransaction.bank_brand_name,
            sepay_account_number: sepayTransaction.account_number,
            sepay_transaction_date: sepayTransaction.transaction_date,
            sepay_amount_out: sepayTransaction.amount_out,
            sepay_amount_in: sepayTransaction.amount_in,
            sepay_accumulated: sepayTransaction.accumulated,
            sepay_transaction_content: sepayTransaction.transaction_content,
            sepay_reference_number: sepayTransaction.reference_number,
            sepay_code: sepayTransaction.code,
            sepay_sub_account: sepayTransaction.sub_account,
            sepay_bank_account_id: sepayTransaction.bank_account_id,
            deposit: sepayTransaction.amount_in,
            reference_number: sepayTransaction.reference_number,
            date: dayjs(sepayTransaction.transaction_date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD"),
            bank_account: bankAccount && bankAccount[0] ? bankAccount[0].name : null
          },
          "name"
        );
        if (upsertedBankTransaction && upsertedBankTransaction.name) {
          await this.db.sepay_transaction.update({
            where: { id: existingTransaction.id },
            data: { bank_transaction_name: upsertedBankTransaction.name }
          });
        }
      }
    } catch (error) {
      // Better to capture exception right here than fail the whole flow
      Sentry.captureException(error);
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

  async enqueueMisaBackgroundJob(qrRecord) {
    const payload = {
      job_type: Misa.Constants.JOB_TYPE.CREATE_QR_VOUCHER,
      data: {
        qr_transaction_id: qrRecord.id
      }
    };

    await this.env["MISA_QUEUE"].send(payload, { delaySeconds: Misa.Constants.DELAYS.ONE_MINUTE });
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
        const createdSepayTransaction = await service.saveToDb(message.body);
        if (createdSepayTransaction) {
          await service.sendToLark(message.body, createdSepayTransaction);
          await service.sendToERP(message.body, createdSepayTransaction);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
