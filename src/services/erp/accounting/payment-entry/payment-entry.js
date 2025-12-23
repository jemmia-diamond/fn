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
    const mapping = {
      "Cửa hàng HCM": "Hồ Chí Minh",
      "Cửa hàng Hồ Chí Minh": "Hồ Chí Minh",
      "Cửa hàng Hà Nội": "Hà Nội",
      "Cửa hàng Cần Thơ": "Cần Thơ"
    };
    return mapping[branch] || branch || null;
  }

  async processManualPayment(rawPaymentEntry) {
    const paymentEntry = rawToPaymentEntry(rawPaymentEntry);
    const references = paymentEntry.references || [];
    const salesOrderReferences = references.filter((ref) => ref.reference_doctype === "Sales Order");
    const primaryOrder = salesOrderReferences[0] ? rawToReference(salesOrderReferences[0]) : null;
    const haravan_order_id = primaryOrder?.sales_order_details?.haravan_order_id
      ? parseInt(primaryOrder.sales_order_details.haravan_order_id, 10) : null;

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
      transfer_note: primaryOrder?.order_number || "ORDERLATER",
      haravan_order_id,
      haravan_order_name: primaryOrder?.order_number || "Đơn hàng cọc",
      transfer_status: Constants.TRANSFER_STATUS.PENDING,
      gateway: paymentEntry.gateway
    };

    const result = await this.manualPaymentService.createManualPayment(data);
    if (result && result.payment_entry_name) {
      const custom_transfer_status = PaymentEntryStatus.PENDING;
      const payment_order_status = PaymentOrderStatus.PENDING;

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

  async processQRPayment(paymentEntry) {
    const references = paymentEntry.references || [];
    const salesOrderReferences = references.filter((ref) => ref.reference_doctype === "Sales Order");

    const payment_references = salesOrderReferences.length > 0
      ? salesOrderReferences.map(ref => ({
        haravan_order_id: parseInt(ref.sales_order_details.haravan_order_id, 10),
        order_number: ref.order_number,
        allocated_amount: ref.allocated_amount,
        outstanding_amount: ref.outstanding_amount
      })) : [];

    const primaryOrder = salesOrderReferences[0] ? rawToReference(salesOrderReferences[0]) : null;
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
      haravan_order_total_price: primaryOrder ? primaryOrder.total_amount : null,
      haravan_order_number: primaryOrder ? primaryOrder.sales_order_details.haravan_order_number : (paymentEntry.haravan_order_number || "Đơn hàng cọc"),
      haravan_order_status: primaryOrder ? primaryOrder.sales_order_details.haravan_financial_status : null,
      haravan_order_id: primaryOrder ? primaryOrder.sales_order_details.haravan_order_id : null,
      lark_record_id: paymentEntry.lark_record_id || "",
      payment_entry_name: paymentEntry.name || "",
      customer_phone_order_later: customer_phone_number,
      customer_name_order_later: customer_name,
      payment_references
    };

    const result = await this.createQRService.handlePostQr(qrGeneratorPayload);

    // Update Payment Entry with QR code URL
    if (result && result.payment_entry_name) {
      await this.frappeClient.upsert({
        doctype: this.doctype,
        name: result.payment_entry_name,
        qr_url: `${this.env.PAYMENT_QR_BASE_URL}/${result.id}`,
        custom_transaction_id: result.id,
        custom_transfer_note: result.transfer_note,
        custom_transfer_status: result.transfer_status,
        payment_order_status: PaymentOrderStatus.PENDING
      }, "name");
    }

    return result;
  }

  async processPaymentEntry(rawPaymentEntry) {
    const paymentEntry = rawToPaymentEntry(rawPaymentEntry);
    const paymentCode = paymentEntry.payment_code;

    if (!paymentCode) {
      throw new Error("payment_code is required in Payment Entry");
    }

    if (this._isQRPayment(paymentCode)) {
      return await this.processQRPayment(paymentEntry);
    } else if (this._isManualPayment(paymentCode)) {
      return await this.processManualPayment(paymentEntry);
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
    let manualPaymentUuid = paymentEntry.custom_transaction_id;

    let existingPayment;
    if (manualPaymentUuid) {
      existingPayment = await this.db.manualPaymentTransaction.findUnique({
        where: { uuid: manualPaymentUuid }
      });
    }

    if (!existingPayment && paymentEntry.name) {
      existingPayment = await this.db.manualPaymentTransaction.findFirst({
        where: { payment_entry_name: paymentEntry.name }
      });
      manualPaymentUuid = existingPayment?.uuid;
    }

    if (!existingPayment) return;

    const references = paymentEntry.references || [];
    const salesOrderReferences = references.filter((ref) => ref.reference_doctype === "Sales Order");
    const primaryOrder = salesOrderReferences[0] ? rawToReference(salesOrderReferences[0]) : null;
    const haravan_order_id = primaryOrder?.sales_order_details?.haravan_order_id
      ? parseInt(primaryOrder.sales_order_details.haravan_order_id, 10) : null;

    const receive_date = paymentEntry.payment_date ? dayjs(paymentEntry.payment_date).utc().toDate() : null;
    const isOrderLinking = primaryOrder && haravan_order_id;
    const transfer_status = paymentEntry.verified_by ? Constants.TRANSFER_STATUS.CONFIRMED : Constants.TRANSFER_STATUS.PENDING;

    const data = {
      payment_type: this._mapPaymentMethod(paymentEntry.payment_code),
      branch: this._mapBranch(paymentEntry.bank_account_branch),
      receive_date,
      bank_account: paymentEntry.bank_account_no || null,
      bank_name: paymentEntry.bank || null,
      transfer_amount: paymentEntry.paid_amount || paymentEntry.received_amount || null,
      transfer_note: primaryOrder?.order_number || "ORDERLATER",
      haravan_order_id: isOrderLinking ? haravan_order_id : null,
      haravan_order_name: isOrderLinking ? primaryOrder.order_number : "Đơn hàng cọc",
      transfer_status,
      gateway: paymentEntry.gateway,
      payment_entry_name: paymentEntry.name
    };

    const result = await this.manualPaymentService.updateManualPayment(manualPaymentUuid, data);

    if (result && result.payment_entry_name) {
      const isConfirmed = paymentEntry.verified_by != null;
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

    const references = paymentEntry.references || [];
    const salesOrderReferences = references.filter(
      (ref) => ref.reference_doctype === "Sales Order"
    );

    const primaryOrder = salesOrderReferences[0] ? rawToReference(salesOrderReferences[0]) : null;
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

    if (qrPayment.payment_entry_name !== paymentEntry.name) return;

    if (salesOrderReferences?.length === 1) {
      const toPayAmount = parseFloat(qrPayment.transfer_amount);
      const outstandingAmount = parseFloat(primaryOrder.outstanding_amount);

      if (toPayAmount > outstandingAmount) {
        throw new Error(JSON.stringify({
          error_msg: `Payment amount ${toPayAmount} exceeds remaining amount ${outstandingAmount}`,
          error_code: LinkQRWithRealOrderService.OVERPAYMENT
        }));
      }
    }

    let updateQr = qrPayment;
    if (qrPayment.haravan_order_number === "ORDERLATER" && primaryOrder) {
      updateQr = await this.updateOrderLater(
        qrPaymentId, {
          haravan_order_number: primaryOrder?.sales_order_details?.haravan_order_number || null,
          haravan_order_id: primaryOrder?.sales_order_details?.haravan_order_id || null,
          haravan_order_status: primaryOrder?.sales_order_details?.haravan_financial_status || null,
          haravan_order_total_price: primaryOrder?.total_amount || null,
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

    const isSuccess = paymentEntry.bank_transactions?.length >= 1 && updateQr.haravan_order_id;
    const payment_order_status = isSuccess ? PaymentOrderStatus.SUCCESS : PaymentOrderStatus.PENDING;

    await this.frappeClient.update({
      doctype: this.doctype,
      name: paymentEntry.name,
      payment_order_status
    }, "name");

    if (isSuccess && updateQr.haravan_order_id) {
      const jobType = Misa.Constants.JOB_TYPE.CREATE_QR_VOUCHER;
      await this._enqueueMisaBackgroundJob(jobType, { qr_transaction_id: qrPaymentId });
    }
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
        if (erpTopic === "create") {
          await paymentEntryService.processPaymentEntry(rawPaymentEntry);
        } else if (erpTopic === "update") {
          await paymentEntryService.updatePaymentEntry(rawPaymentEntry);
        } else if (erpTopic === "verify") {
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
