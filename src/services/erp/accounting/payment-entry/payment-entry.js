import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import PaymentService from "services/payment";
import * as Constants from "services/erp/accounting/constants";

dayjs.extend(utc);

export default class PaymentEntryService {
  constructor(env) {
    this.env = env;
    this.doctype = "Payment Entry";
    this.frappeClient = new FrappeClient(
      {
        url: env.JEMMIA_ERP_BASE_URL,
        apiKey: env.JEMMIA_ERP_API_KEY,
        apiSecret: env.JEMMIA_ERP_API_SECRET
      }
    );

    this.db = Database.instance(env);
    this.createQRService = new PaymentService.CreateQRService(env);
    this.manualPaymentService = new PaymentService.ManualPaymentService(env);
  };

  _isQRPayment(modeOfPayment) {
    return Constants.QR_PAYMENT_METHODS.includes(modeOfPayment);
  }

  _isManualPayment(modeOfPayment) {
    return Constants.MANUAL_PAYMENT_METHODS.includes(modeOfPayment);
  }

  _mapPaymentMethod(modeOfPayment) {
    return Constants.PAYMENT_METHOD_MAPPING[modeOfPayment] || null;
  }

  _mapBranch(branch) {
    const mapping = {
      "Cửa hàng HCM": "Hồ Chí Minh",
      "Cửa hàng Hồ Chí Minh": "Hồ Chí Minh",
      "Cửa hàng Hà Nội": "Hà Nội",
      "Cửa hàng Cần Thơ": "Cần Thơ"
    };
    return mapping[branch] || branch || null;
  }

  _extractManualPaymentData(paymentEntry) {
    const references = paymentEntry.references || [];
    const salesOrderReference = references.find((ref) => ref.reference_doctype === "Sales Order");

    const data = {
      payment_entry_name: paymentEntry.name,
      payment_type: this._mapPaymentMethod(paymentEntry.mode_of_payment),
      branch: this._mapBranch(paymentEntry.bank_account_branch),
      shipping_code: null,
      send_date: null,
      receive_date: null,
      created_date: null,
      updated_date: null,
      bank_account: paymentEntry.bank_account_no || null,
      bank_name: paymentEntry.bank || null,
      transfer_amount: paymentEntry.paid_amount || paymentEntry.received_amount || null,
      transfer_note: paymentEntry.remarks || null,
      haravan_order_id: salesOrderReference?.sales_order_details?.haravan_order_id
        ? parseInt(salesOrderReference.sales_order_details.haravan_order_id, 10) : null,
      haravan_order_name: salesOrderReference?.order_number || null,
      transfer_status: Constants.TRANSFER_STATUS.PENDING,
      gateway: paymentEntry.gateway
    };

    return data;
  }

  async processManualPayment(paymentEntry) {
    const manualPaymentData = this._extractManualPaymentData(paymentEntry);
    const result = await this.manualPaymentService.createManualPayment(manualPaymentData);

    return result;
  }

  async processQRPayment(paymentEntry) {
    const references = paymentEntry.references || [];
    const salesOrderReference = references.find(
      (ref) => ref.reference_doctype === "Sales Order"
    );

    const qrGeneratorPayload = {
      bank_code: paymentEntry.bank_details.bank_code,
      bank_account_number: paymentEntry.bank_account_no,
      bank_account_name: paymentEntry.bank_account,
      bank_bin: paymentEntry.bank_details.bank_bin,
      bank_name: paymentEntry.bank_details.bank_name,
      customer_name: paymentEntry.customer_details.name,
      customer_phone_number: paymentEntry.customer_details.phone,
      transfer_amount: paymentEntry.paid_amount,
      haravan_order_total_price: salesOrderReference ? salesOrderReference.total_amount : null,
      haravan_order_number: salesOrderReference ? salesOrderReference.sales_order_details.haravan_order_number : (paymentEntry.haravan_order_number || "Đơn hàng cọc"),
      haravan_order_status: salesOrderReference ? salesOrderReference.sales_order_details.haravan_financial_status : null,
      haravan_order_id: salesOrderReference ? salesOrderReference.sales_order_details.haravan_order_id : null,
      lark_record_id: paymentEntry.lark_record_id || "",
      payment_entry_name: paymentEntry.name || "",
      customer_phone_order_later: paymentEntry.customer_details.phone,
      customer_name_order_later: paymentEntry.customer_details.name
    };

    const result = await this.createQRService.handlePostQr(qrGeneratorPayload);

    // Update Payment Entry with QR code URL
    if (result && result.payment_entry_name) {
      await this.frappeClient.upsert({
        doctype: this.doctype,
        name: result.payment_entry_name,
        qr_url: result.qr_url,
        custom_transaction_id: result.id,
        custom_transfer_note: result.transfer_note,
        custom_transfer_status: result.transfer_status
      }, "name");
    }

    return result;
  }

  async processPaymentEntry(paymentEntry) {
    const modeOfPayment = paymentEntry.mode_of_payment;

    if (!modeOfPayment) {
      throw new Error("mode_of_payment is required in Payment Entry");
    }

    if (this._isQRPayment(modeOfPayment)) {
      return await this.processQRPayment(paymentEntry);
    } else if (this._isManualPayment(modeOfPayment)) {
      return await this.processManualPayment(paymentEntry);
    } else {
      throw new Error(`Unsupported mode_of_payment: ${modeOfPayment}`);
    }
  }

  static async dequeuePaymentEntryQueue(batch, env) {
    const paymentEntryService = new PaymentEntryService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const paymentEntry = message.body;
      try {
        await paymentEntryService.processPaymentEntry(paymentEntry);
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
