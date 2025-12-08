import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import PaymentService from "services/payment";
import LinkQRWithRealOrderService from "services/payment/qr_payment/link-qr-with-real-order-service";

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

  /**
   * Map Payment Entry to Sales Order
   * @param {*} paymentEntry
   * @returns
   */
  async updatePaymentEntry(paymentEntry) {
    const references = paymentEntry.references || [];
    const salesOrderReferences = references.filter(
      (ref) => ref.reference_doctype === "Sales Order"
    );

    if (salesOrderReferences.length !== 1) {
      // Exit if there isn't exactly one sales order reference.
      return;
    }

    const mappedSalesOrderReference = salesOrderReferences[0];

    const qrPaymentId = paymentEntry.custom_transaction_id;

    const qrPayment = await this.db.qrPaymentTransaction.findUnique({
      where: { id: qrPaymentId, is_deleted: false }
    });

    if (!qrPayment) {
      throw new Error(JSON.stringify({
        error_msg: `QR with id ${qrPaymentId} not found`,
        error_code: LinkQRWithRealOrderService.NOT_FOUND
      }));
    }

    // ignore if QR is not success
    if (qrPayment.transfer_status !== "success") {
      return;
    }

    // ignore if QR is not ORDERLATER
    if (qrPayment.haravan_order_number !== "ORDERLATER" && qrPayment.haravan_order_number && qrPayment.haravan_order_number !== "") {
      if (qrPayment.haravan_order_number === mappedSalesOrderReference.sales_order_details.haravan_order_number) {
        return;
      }

      throw new Error(JSON.stringify({
        error_msg: `QR with id ${qrPaymentId} is not order later`,
        error_code: LinkQRWithRealOrderService.ORDER_NOT_LATER
      }));
    }

    let toPayAmount = parseFloat(qrPayment.transfer_amount);
    const remainingAmount = parseFloat(mappedSalesOrderReference.remaining_amount);

    if (toPayAmount > remainingAmount) {
      throw new Error(JSON.stringify({

      }));
        throw new Error(JSON.stringify({
          error_msg: `Payment amount ${toPayAmount} exceeds remaining amount ${remainingAmount}`,
          error_code: LinkQRWithRealOrderService.OVERPAYMENT
        }));
      qrPaymentId, {
        haravan_order_number: mappedSalesOrderReference.sales_order_details.haravan_order_number,
        haravan_order_id: parseInt(mappedSalesOrderReference.sales_order_details.haravan_order_id, 10),
        haravan_order_status: mappedSalesOrderReference.sales_order_details.haravan_financial_status,
        haravan_order_total_price: mappedSalesOrderReference.sales_order_details.haravan_order_total_price,
        transfer_status: "success",
        customer_name: mappedSalesOrderReference.sales_order_details.customer_name,
        customer_phone_number: mappedSalesOrderReference.sales_order_details.customer_phone_number
      }
    );

    if (!updateQr) {
      throw new Error(JSON.stringify({
        error_msg: `Failed to update QR with id ${qrPaymentId}`,
        error_code: LinkQRWithRealOrderService.UPDATE_QR_FAILED
      }));
    }

    await this.frappeClient.update({
      doctype: this.doctype,
      name: paymentEntry.name,
      custom_transfer_status: updateQr.transfer_status
    }, "name");

    return updateQr;
  }

  static async dequeuePaymentEntryQueue(batch, env) {
    const paymentEntryService = new PaymentEntryService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const messageBody = message.body;
      const erpTopic = messageBody.erpTopic || "";
      const paymentEntry = messageBody.data || messageBody;

      try {
        if (erpTopic === "create") {
          await paymentEntryService.processPaymentEntry(paymentEntry);
        } else if (erpTopic == "update") {
          await paymentEntryService.updatePaymentEntry(paymentEntry);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  async updateOrderLater(id, body) {
    const dataToUpdate = {
      haravan_order_number: body.haravan_order_number,
      haravan_order_id: parseInt(body.haravan_order_id, 10),
      haravan_order_status: body.haravan_order_status,
      haravan_order_total_price: body.haravan_order_total_price,
      transfer_status: "success"
    };

    if (body.customer_name) {
      dataToUpdate.customer_name = body.customer_name;
    }

    if (body.customer_phone_number) {
      dataToUpdate.customer_phone_number = body.customer_phone_number;
    }

    return await this.db.qrPaymentTransaction.update({
      where: { id: id },
      data: dataToUpdate
    });
  }
}
