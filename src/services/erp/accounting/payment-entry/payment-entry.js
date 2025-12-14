import FrappeClient from "src/frappe/frappe-client";
import Database from "src/services/database";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import * as Sentry from "@sentry/cloudflare";
import PaymentService from "services/payment";
import * as Constants from "services/erp/accounting/payment-entry/constants";
import LinkQRWithRealOrderService from "services/payment/qr_payment/link-qr-with-real-order-service";
import { PaymentEntryStatus, PaymentOrderStatus, rawToPaymentEntry, rawToReference } from "services/erp/accounting/payment-entry/mapping";
import BankTransactionVerificationService from "services/erp/accounting/payment-entry/verification-service";
import Misa from "services/misa";

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

  _isQRPayment(paymentCode) {
    return Constants.QR_PAYMENT_METHODS.includes(paymentCode);
  }

  _isManualPayment(paymentCode) {
    return Constants.MANUAL_PAYMENT_METHODS.includes(paymentCode);
  }

  _mapPaymentMethod(paymentCode) {
    return Constants.PAYMENT_METHOD_MAPPING[paymentCode] || null;
  }

  _mapBranch(branch) {
    return Constants.BRANCH_MAPPING[branch] || branch || null;
  }

  _getSalesOrderReference(references) {
    return (references || []).find((ref) => ref.reference_doctype === Constants.REFERENCE_DOCTYPES.SALES_ORDER);
  }

  async createManualPayment(rawPaymentEntry) {
    const paymentEntry = rawToPaymentEntry(rawPaymentEntry);
    const salesOrderReference = this._getSalesOrderReference(paymentEntry.references);
    const haravan_order_id = salesOrderReference?.sales_order_details?.haravan_order_id
      ? parseInt(salesOrderReference.sales_order_details.haravan_order_id, 10) : null;
    const receive_date = paymentEntry.payment_date ? dayjs(paymentEntry.payment_date).utc().toDate() : null;
    const created_date = paymentEntry.creation ? dayjs(paymentEntry.creation).utc().toDate() : null;

    const data = {
      payment_entry_name: paymentEntry.name,
      payment_type: this._mapPaymentMethod(paymentEntry.payment_code),
      branch: this._mapBranch(paymentEntry.bank_account_branch),
      shipping_code: null,
      send_date: null,
      receive_date,
      created_date,
      updated_date: null,
      bank_account: paymentEntry.bank_account_no || null,
      bank_name: paymentEntry.bank || null,
      transfer_amount: paymentEntry.paid_amount || paymentEntry.received_amount || null,
      transfer_note: salesOrderReference?.order_number || Constants.HARAVAN_DEFAULTS.ORDER_LATER,
      haravan_order_id,
      haravan_order_name: salesOrderReference?.order_number || Constants.HARAVAN_DEFAULTS.DEPOSIT_ORDER,
      transfer_status: (receive_date && haravan_order_id) ? Constants.TRANSFER_STATUS.CONFIRMED : Constants.TRANSFER_STATUS.PENDING,
      gateway: paymentEntry.gateway
    };

    const result = await this.manualPaymentService.createManualPayment(data);
    if (result && result.payment_entry_name) {
      const isConfirmed = result.transfer_status === Constants.TRANSFER_STATUS.CONFIRMED;
      const custom_transfer_status = isConfirmed ? PaymentEntryStatus.SUCCESS : PaymentEntryStatus.PENDING;
      const payment_order_status = isConfirmed ? PaymentOrderStatus.SUCCESS : PaymentOrderStatus.PENDING;

      await this.frappeClient.upsert({
        doctype: this.doctype,
        name: result.payment_entry_name,
        custom_transaction_id: result.uuid,
        custom_transfer_note: result.transfer_note,
        custom_transfer_status,
        payment_order_status
      }, "name");
    }

    return result;
  }

  async createQRPayment(paymentEntry) {
    const salesOrderReference = this._getSalesOrderReference(paymentEntry.references);

    const customer_name = paymentEntry?.customer_details?.name;
    const customer_phone_number = paymentEntry?.customer_details?.phone || paymentEntry?.customer_details?.mobile_no;
    const qrGeneratorPayload = {
      bank_code: paymentEntry?.bank_details?.bank_code,
      bank_account_number: paymentEntry?.bank_account_no,
      bank_account_name: paymentEntry.bank_account,
      bank_bin: paymentEntry?.bank_details?.bank_bin,
      bank_name: paymentEntry?.bank_details?.bank_name,
      customer_name,
      customer_phone_number,
      transfer_amount: paymentEntry.paid_amount,
      haravan_order_total_price: salesOrderReference ? salesOrderReference.total_amount : null,
      haravan_order_number: salesOrderReference ? salesOrderReference.sales_order_details.haravan_order_number : (paymentEntry.haravan_order_number || Constants.HARAVAN_DEFAULTS.DEPOSIT_ORDER),
      haravan_order_status: salesOrderReference ? salesOrderReference.sales_order_details.haravan_financial_status : null,
      haravan_order_id: salesOrderReference ? salesOrderReference.sales_order_details.haravan_order_id : null,
      lark_record_id: paymentEntry.lark_record_id || "",
      payment_entry_name: paymentEntry.name || "",
      customer_phone_order_later: customer_phone_number,
      customer_name_order_later: customer_name
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
        custom_transfer_status: result.transfer_status,
        payment_order_status: PaymentOrderStatus.PENDING
      }, "name");
    }

    return result;
  }

  async createPaymentEntry(rawPaymentEntry) {
    const paymentEntry = rawToPaymentEntry(rawPaymentEntry);
    const paymentCode = paymentEntry.payment_code;

    if (!paymentCode) {
      throw new Error("payment_code is required in Payment Entry");
    }

    if (this._isQRPayment(paymentCode)) {
      return await this.createQRPayment(paymentEntry);
    } else if (this._isManualPayment(paymentCode)) {
      return await this.createManualPayment(paymentEntry);
    } else {
      throw new Error(`Unsupported payment_code: ${paymentCode}`);
    }
  }

  async updatePaymentEntry(rawPaymentEntry) {
    const paymentEntry = rawToPaymentEntry(rawPaymentEntry);
    const paymentCode = paymentEntry.payment_code;

    if (!paymentCode) {
      throw new Error("payment_code is required in Payment Entry");
    }

    if (this._isQRPayment(paymentCode)) {
      return await this.updateQRPayment(paymentEntry);
    } else if (this._isManualPayment(paymentCode)) {
      return await this.updateManualPayment(paymentEntry);
    } else {
      throw new Error(`Unsupported payment_code: ${paymentCode}`);
    }
  }

  async updateManualPayment(rawPaymentEntry) {
    const paymentEntry = rawToPaymentEntry(rawPaymentEntry);
    const manualPaymentUuid = paymentEntry.custom_transaction_id;
    if (!manualPaymentUuid) return;

    const existingPayment = await this.db.manualPaymentTransaction.findUnique({
      where: { uuid: manualPaymentUuid }
    });

    if (!existingPayment) return;

    const salesOrderReference = this._getSalesOrderReference(paymentEntry.references);
    const haravan_order_id = salesOrderReference?.sales_order_details?.haravan_order_id
      ? parseInt(salesOrderReference.sales_order_details.haravan_order_id, 10) : null;
    const receive_date = paymentEntry.payment_date ? dayjs(paymentEntry.payment_date).utc().toDate() : null;
    const isOrderLinking = salesOrderReference && haravan_order_id;

    const data = {
      payment_type: this._mapPaymentMethod(paymentEntry.payment_code),
      branch: this._mapBranch(paymentEntry.bank_account_branch),
      receive_date,
      bank_account: paymentEntry.bank_account_no || null,
      bank_name: paymentEntry.bank || null,
      transfer_amount: paymentEntry.paid_amount || paymentEntry.received_amount || null,
      transfer_note: salesOrderReference?.order_number || paymentEntry.custom_transfer_note || "",
      haravan_order_id: isOrderLinking ? haravan_order_id : null,
      haravan_order_name: isOrderLinking ? salesOrderReference.order_number : null,
      transfer_status: paymentEntry.custom_transfer_status === PaymentEntryStatus.SUCCESS ? Constants.TRANSFER_STATUS.CONFIRMED :
        paymentEntry.custom_transfer_status === PaymentEntryStatus.CANCEL ? Constants.TRANSFER_STATUS.CANCELLED :
          Constants.TRANSFER_STATUS.PENDING,
      gateway: paymentEntry.gateway,
      payment_entry_name: paymentEntry.name
    };

    if(paymentEntry.verified_by) {
      data.transfer_status = "Xác nhận";
    }

    const result = await this.manualPaymentService.updateManualPayment(manualPaymentUuid, data);

    if (result && result.payment_entry_name) {
      const isConfirmed = result.transfer_status === Constants.TRANSFER_STATUS.CONFIRMED;
      const custom_transfer_status = isConfirmed ? PaymentEntryStatus.SUCCESS : PaymentEntryStatus.PENDING;
      const payment_order_status = isConfirmed ? PaymentOrderStatus.SUCCESS : PaymentOrderStatus.PENDING;

      await this.frappeClient.upsert({
        doctype: this.doctype,
        name: result.payment_entry_name,
        custom_transfer_note: result.transfer_note,
        custom_transfer_status,
        payment_order_status
      }, "name");

      if (isConfirmed && isOrderLinking && paymentEntry.verified_by && haravan_order_id) {
        const jobType = Misa.Constants.JOB_TYPE.CREATE_MANUAL_VOUCHER;
        await this._enqueueMisaBackgroundJob(jobType, { manual_payment_uuid: manualPaymentUuid });
      }
    }

    return result;
  }

  /**
   * Process payment entry update (link payment to sales order)
   *
   * It handles the linkage between a Payment Entry (from ERP) and a specific Sales Order.
   *
   * Logic:
   * 1. Validates the QR payment transaction (must be "success" and match details).
   * 2. Checks for overpayment against the Sales Order's outstanding amount.
   * 3. IF the QR payment was an "ORDERLATER" placeholder:
   *    - It maps the real Haravan Order details to the QR transaction.
   *    - NOTE: This mapping should be performed only once to ensure transparency.
   * 4. IF the QR payment was ALREADY linked to a specific order (not "ORDERLATER"):
   *    - It skips the mapping step and proceeds to update the status.
   * 5. Updates the Payment Entry's `payment_order_status` to "Success" in the ERP system.
   *
   * @param {*} rawPaymentEntry - The raw payment entry data from the webhook/queue
   * @returns {Promise<Object|void>} - The updated QR transaction object or void if skipped
   */
  async updateQRPayment(rawPaymentEntry) {
    const paymentEntry = rawToPaymentEntry(rawPaymentEntry);

    const salesOrderReference = this._getSalesOrderReference(paymentEntry.references);

    if (!salesOrderReference) {
      return;
    }

    const mappedSalesOrderReference = rawToReference(salesOrderReference);
    const qrPaymentId = paymentEntry.custom_transaction_id;
    if (!qrPaymentId) return;

    const qrPayment = await this.db.qrPaymentTransaction.findUnique({
      where: { id: qrPaymentId, is_deleted: false }
    });

    if (!qrPayment) {
      throw new Error(JSON.stringify({
        error_msg: `QR with id ${qrPaymentId} not found`,
        error_code: LinkQRWithRealOrderService.NOT_FOUND
      }));
    }

    // return if QR's payment entry name is not match with payment entry name
    if (qrPayment.payment_entry_name !== paymentEntry.name) {
      return;
    }

    // return if QR is not success
    if (qrPayment.transfer_status !== PaymentEntryStatus.SUCCESS) {
      return;
    }

    // return if QR's haravan_order_number is empty
    if (!qrPayment.haravan_order_number) {
      return;
    }

    const toPayAmount = parseFloat(qrPayment.transfer_amount);
    const outstandingAmount = parseFloat(mappedSalesOrderReference.outstanding_amount);

    if (toPayAmount > outstandingAmount) {
      throw new Error(JSON.stringify({
        error_msg: `Payment amount ${toPayAmount} exceeds remaining amount ${outstandingAmount}`,
        error_code: LinkQRWithRealOrderService.OVERPAYMENT
      }));
    }

    let updateQr = qrPayment;
    if (qrPayment.haravan_order_number === Constants.HARAVAN_DEFAULTS.ORDER_LATER) {
      updateQr = await this.updateOrderLater(
        qrPaymentId, {
          haravan_order_number: mappedSalesOrderReference.sales_order_details.haravan_order_number,
          haravan_order_id: mappedSalesOrderReference.sales_order_details.haravan_order_id,
          haravan_order_status: mappedSalesOrderReference.sales_order_details.haravan_financial_status,
          haravan_order_total_price: mappedSalesOrderReference.total_amount,
          customer_name: paymentEntry.customer_details.name,
          customer_phone_number: paymentEntry.customer_details.phone || paymentEntry.customer_details.mobile_no
        }
      );

      if (!updateQr) {
        throw new Error(JSON.stringify({
          error_msg: `Failed to update QR with id ${qrPaymentId}`,
          error_code: LinkQRWithRealOrderService.UPDATE_QR_FAILED
        }));
      }
    }

    await this.frappeClient.update({
      doctype: this.doctype,
      name: paymentEntry.name,
      payment_order_status: PaymentOrderStatus.SUCCESS
    }, "name");

    const jobType = Misa.Constants.JOB_TYPE.CREATE_QR_VOUCHER;
    await this._enqueueMisaBackgroundJob(jobType, { qr_transaction_id: qrPaymentId });
    return updateQr;
  }

  async verifyPaymentEntryBankTransaction(paymentEntry) {
    if (!paymentEntry.bank_transactions || paymentEntry.bank_transactions.length !== 1) {
      return;
    }

    const service = new BankTransactionVerificationService(this.env);
    await service.verifyAndUpdatePaymentEntry(paymentEntry);
  }

  static async dequeuePaymentEntryQueue(batch, env) {
    const paymentEntryService = new PaymentEntryService(env);
    const messages = batch.messages;
    for (const message of messages) {
      const messageBody = message.body;
      const erpTopic = messageBody.erpTopic || "";
      const rawPaymentEntry = messageBody.data;

      try {
        if (erpTopic === Constants.PAYMENT_ENTRY_WEBHOOK_TOPIC.CREATE) {
          await paymentEntryService.createPaymentEntry(rawPaymentEntry);
        } else if (erpTopic === Constants.PAYMENT_ENTRY_WEBHOOK_TOPIC.UPDATE) {
          await paymentEntryService.updatePaymentEntry(rawPaymentEntry);
        } else if (erpTopic === Constants.PAYMENT_ENTRY_WEBHOOK_TOPIC.VERIFY) {
          await paymentEntryService.verifyPaymentEntryBankTransaction(rawPaymentEntry);
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
      haravan_order_total_price: body.haravan_order_total_price
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

  async _enqueueMisaBackgroundJob(job_type, data) {
    const payload = { job_type, data };
    await this.env["MISA_QUEUE"].send(payload, { delaySeconds: Misa.Constants.DELAYS.ONE_MINUTE });
  }
}
