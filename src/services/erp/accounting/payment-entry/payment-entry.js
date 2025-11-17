import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import CreateQRService from "src/services/payment/qr_payment/create-qr-service";

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
    this.createQRService = new CreateQRService(env);
  };

  async processPaymentEntry(paymentEntry) {
    /**
      "bank_code": "",
      "bank_account_number": "",
      "bank_account_name": "",
      "bank_bin": "",
      "bank_name": "",

      "customer_name": "",
      "customer_phone_number": "",
      "transfer_amount": 0,

      "haravan_order_total_price": "",
      "haravan_order_number": "",
      "haravan_order_status": "",
      "haravan_order_id": "",
      "lark_record_id": "",

      "customer_phone_order_later": "",
      "customer_name_order_later": ""
    */

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
      lark_record_id: paymentEntry.lark_record_id || paymentEntry.name,
      customer_phone_order_later: paymentEntry.customer_details.phone,
      customer_name_order_later: paymentEntry.customer_details.name
    };

    const result = await this.createQRService.handle_post_qr(qrGeneratorPayload);

    // Update Payment Entry with QR code URL
    await this.frappeClient.upsert({
      doctype: this.doctype,
      name: paymentEntry.name,
      qr_url: result.qr_url,
      custom_transaction_id: result.id,
      custom_transfer_note: result.transfer_note,
      custom_transfer_status: result.transfer_status
    }, "name");

    return result;
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
