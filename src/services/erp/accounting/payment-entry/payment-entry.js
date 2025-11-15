import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

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

    const qrGeneratorPayload = {
      bank_code: paymentEntry.bank_details.bank_code,
      bank_account_number: paymentEntry.bank_account_no,
      bank_account_name: paymentEntry.bank_account,
      bank_bin: paymentEntry.bank_details.bank_bin,
      bank_name: paymentEntry.bank_details.bank_name,
      customer_name: paymentEntry.customer_details.name,
      customer_phone_number: paymentEntry.customer_details.phone,
      transfer_amount: paymentEntry.paid_amount,
      haravan_order_total_price: paymentEntry.haravan_order_total_price,
      haravan_order_number: paymentEntry.haravan_order_number || "Đơn hàng cọc",
      haravan_order_status: paymentEntry.haravan_order_status,
      haravan_order_id: paymentEntry.haravan_order_id,
      lark_record_id: paymentEntry.lark_record_id || paymentEntry.name,
      customer_phone_order_later: paymentEntry.customer_details.phone,
      customer_name_order_later: paymentEntry.customer_details.name
    };
    const response = await fetch("https://y3tuxuk2yg.execute-api.ap-southeast-1.amazonaws.com/Prod/qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(qrGeneratorPayload)
    });
    const result = await response.json();
    if (result.errorCode) {
      throw new Error(`Failed to generate QR code: ${result.errorMsg}`);
    }
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
