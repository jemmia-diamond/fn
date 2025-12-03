import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

import HaravanAPI from "services/clients/haravan-client";
import { BadRequestException } from "src/exception/exceptions";
import RecordService from "services/larksuite/docs/base/record/record";
import { TABLES } from "services/larksuite/docs/constant";

dayjs.extend(utc);

export default class MapQRWithBankTransactionService {
  static AMOUNT_MISMATCH = "AMOUNT_MISMATCH";
  static INTERNAL_ERROR = "INTERNAL_ERROR";
  static INVALID_STATE = "INVALID_STATE";
  static MISSING_FIELD = "MISSING_FIELD";
  static NOT_FOUND = "NOT_FOUND";

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async mapTransaction(qrPaymentId, sepayTransactionId) {
    const qrPayment = await this.db.qrPaymentTransaction.findUnique({
      where: { id: qrPaymentId, is_deleted: false }
    });

    if (!qrPayment) {
      throw new Error(JSON.stringify({
        error_msg: `QR Payment with ID ${qrPaymentId} not found`,
        error_code: MapQRWithBankTransactionService.NOT_FOUND
      }));
    }

    if (qrPayment.transfer_status !== "pending") {
      throw new Error(JSON.stringify({
        error_msg: `QR Payment with ID ${qrPaymentId} is not in a pending state`,
        error_code: MapQRWithBankTransactionService.INVALID_STATE
      }));
    }

    if (!qrPayment.haravan_order_number) {
      throw new Error(JSON.stringify({
        error_msg: `QR Payment with ID ${qrPaymentId} does not have an associated Haravan order number`,
        error_code: MapQRWithBankTransactionService.MISSING_FIELD
      }));
    }

    const sepayTransaction = await this.db.sepay_transaction.findUnique({
      where: { id: sepayTransactionId }
    });

    if (!sepayTransaction) {
      throw new Error(JSON.stringify({
        error_msg: `Sepay Transaction with ID ${sepayTransactionId} not found`,
        error_code: MapQRWithBankTransactionService.NOT_FOUND
      }));
    }

    const sepayTransactionAmount = parseFloat(sepayTransaction.amount_in);
    if (Math.abs(sepayTransactionAmount - parseFloat(qrPayment.transfer_amount)) > 1000) {
      throw new Error(JSON.stringify({
        error_msg: `Sepay transaction with id ${sepayTransactionId} amount is not equal to QR's amount`,
        error_code: MapQRWithBankTransactionService.AMOUNT_MISMATCH
      }));
    }

    /**
     * If QR is ORDERLATER, just update status to success
     * And update Larksuite record to success
     */
    if (qrPayment.haravan_order_number === "ORDERLATER") {
      const updatedQrPayment = await this.updateQRToSuccess(qrPaymentId);

      if (!updatedQrPayment) {
        throw new Error(JSON.stringify({
          error_msg: `Failed to update order later with id ${qrPaymentId}`,
          error_code: MapQRWithBankTransactionService.INTERNAL_ERROR
        }));
      }

      await this.updateLarksuiteRecordToSuccess(qrPayment.lark_record_id);

      return;
    }

    /**
     * If QR is real ORDER, create transaction in Haravan
     * then, update status to success
     * then, update Larksuite record to success
     */

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();

    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    const haravanService = new HaravanAPI(HRV_API_KEY);

    const createdOrderTransaction = await haravanService.orderTransaction.createTransaction(
      qrPayment.haravan_order_id,
      {
        amount: parseFloat(qrPayment.transfer_amount),
        kind: "capture",
        gateway: "Chuyển khoản ngân hàng (tự động xác nhận giao dịch)"
      }
    );

    if (createdOrderTransaction) {
      const updatedQrPayment = await this.updateQRToSuccess(qrPaymentId);

      if (!updatedQrPayment) {
        throw new Error(JSON.stringify({
          error_msg: `Failed to update QR payment with id ${qrPaymentId}`,
          error_code: MapQRWithBankTransactionService.INTERNAL_ERROR
        }));
      }

      await this.updateLarksuiteRecordToSuccess(qrPayment.lark_record_id);
    }
  }

  async updateQRToSuccess(id) {
    const updatedQrPayment = await this.db.qrPaymentTransaction.update({
      where: { id: id },
      data: {
        transfer_status: "success"
      }
    });
    return updatedQrPayment;
  }

  async updateLarksuiteRecordToSuccess(larkRecordId) {
    const fieldsToUpdate = {
      ["Trạng thái chuyển khoản"]: "Đã hoàn thành"
    };

    return await RecordService.updateLarksuiteRecord({
      env: this.env,
      appToken: TABLES.QR_PAYMENT.app_token,
      tableId: TABLES.QR_PAYMENT.table_id,
      recordId: larkRecordId,
      fields: fieldsToUpdate,
      userIdType: "open_id"
    });
  }
}
