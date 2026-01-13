import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import Misa from "services/misa";
import { PaymentOrderStatus } from "services/erp/accounting/payment-entry/mapping";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

const NOT_FOUND = 404;
const OK = 200;
const BAD_REQUEST = 400;

/**
 * Service to verify Bank Transaction to Payment Entry links
 * Validates that automatic linking is correct before updating PE status
 */
export default class BankTransactionVerificationService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.frappeClient = new FrappeClient({
      url: env.JEMMIA_ERP_BASE_URL,
      apiKey: env.JEMMIA_ERP_API_KEY,
      apiSecret: env.JEMMIA_ERP_API_SECRET
    });
  }

  async verifyAndUpdatePaymentEntry(payload) {
    const references = payload?.references;
    const bank_transactions = payload?.bank_transactions;
    const {
      bank_transaction_name,
      sepay_id,
      sepay_order_number,
      sepay_order_description,
      sepay_amount_in,
      qr_payment_id,
      auto_updated
    } = bank_transactions[0];

    const validation = await this.validatePayload({
      bank_transaction_name,
      payment_entry_name: payload?.name,
      sepay_id,
      sepay_order_number,
      sepay_order_description,
      sepay_amount_in,
      qr_payment_id
    });

    if (!validation.success) {
      return validation;
    }

    const { paymentEntryName } = validation;

    const qrPayment = await this.db.qrPaymentTransaction.findFirst({
      where: {
        id: qr_payment_id,
        payment_entry_name: paymentEntryName,
        is_deleted: false
      }
    });

    if (!qrPayment) {
      return this.failedPayload(
        `QR Payment with payment_entry_name ${paymentEntryName} not found`, "QR_NOT_FOUND",
        { payment_entry: paymentEntryName }, NOT_FOUND);
    }

    if(auto_updated == 1){
      if (qrPayment.haravan_order_number !== sepay_order_number && !qrPayment.haravan_order_id) {
        return this.failedPayload("Order number mismatch", "ORDER_NUMBER_MISMATCH",
          {
            payment_entry: paymentEntryName,
            qr_order_number: qrPayment.haravan_order_number,
            sepay_order_number: sepay_order_number
          });
      }

      if (payload.modified_by === "tech@jemmia.vn" && qrPayment.transfer_note !== sepay_order_description) {
        return this.failedPayload("Order description mismatch", "ORDER_DESC_MISMATCH",
          {
            payment_entry: paymentEntryName,
            qr_transfer_note: qrPayment.transfer_note,
            sepay_order_description: sepay_order_description
          });
      }

      if (parseFloat(qrPayment.transfer_amount) !== parseFloat(sepay_amount_in)) {
        return this.failedPayload("Amount mismatch", "AMOUNT_MISMATCH", {
          payment_entry: paymentEntryName,
          qr_amount: qrPayment.transfer_amount,
          sepay_amount: sepay_amount_in
        });
      }
    }

    const updatedQrPayment = await this.db.qrPaymentTransaction.update({
      where: { id: qrPayment.id },
      data: {
        transfer_status: "success",
        updated_at: dayjs(payload?.payment_date).utc().toDate()
      }
    });

    const successPayment = references.length != 0 ? PaymentOrderStatus.SUCCESS : PaymentOrderStatus.PENDING;
    await this.frappeClient.update({
      doctype: "Payment Entry",
      name: paymentEntryName,
      payment_order_status: successPayment,
      custom_transfer_status: "success",
      verified_by: auto_updated == 1 ? "tech@jemmia.vn" : payload?.modified_by
    });

    if (updatedQrPayment.transfer_status == "success" && updatedQrPayment.haravan_order_id && auto_updated == 1) {
      await this.enqueueMisaBackgroundJob(qrPayment);
    }

    return true;
  }

  failedPayload(error, error_code, details = null, statusCode = BAD_REQUEST) {
    const response = { success: false, error, error_code, statusCode };
    if (details) response.details = details;
    return response;
  }

  async validatePayload(payload) {
    const { sepay_id, payment_entry_name } = payload;

    if (!sepay_id) {
      return this.failedPayload("Bank transaction has no sepay_id", "BANK_TRANSACTION_NO_SEPAY_ID", { sepay_id }, OK);
    }

    if (!payment_entry_name) {
      return this.failedPayload("No payment_entry_name provided", "NO_PAYMENT_ENTRY_NAME", { payment_entry_name }, BAD_REQUEST);
    }

    return {
      success: true,
      paymentEntryName: payment_entry_name
    };
  }

  async enqueueMisaBackgroundJob(qrRecord) {
    const payload = {
      job_type: Misa.Constants.JOB_TYPE.CREATE_QR_VOUCHER,
      data: {
        qr_transaction_id: qrRecord.id
      }
    };

    await this.env["MISA_QUEUE"].send(payload);
  }
}
