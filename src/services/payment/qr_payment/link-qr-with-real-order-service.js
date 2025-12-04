import dayjs from "dayjs";

import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

import HaravanAPI from "services/clients/haravan-client";
import { BadRequestException } from "src/exception/exceptions";
import RecordService from "services/larksuite/docs/base/record/record";
import { TABLES } from "services/larksuite/docs/constant";

dayjs.extend(utc);

export default class LinkQRWithRealOrderService {
  static AMOUNT_MISMATCH = "AMOUNT_MISMATCH";
  static INTERNAL_ERROR = "INTERNAL_ERROR";
  static INVALID_STATE = "INVALID_STATE";
  static MISSING_FIELD = "MISSING_FIELD";
  static NOT_FOUND = "NOT_FOUND";
  static CUSTOMER_MISMATCH = "CUSTOMER_MISMATCH";
  static ORDER_NOT_LATER = "ORDER_NOT_LATER";
  static TRANSACTION_CREATION_ERROR = "TRANSACTION_CREATION_ERROR";

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async mapTransaction(qrPaymentId, body) {
    const requiredFields = {
      "customer_name": "Missing 'customer_name' in request body.",
      "customer_phone_number": "Missing 'customer_phone_number' in request body.",
      "haravan_order_total_price": "Missing 'haravan_order_total_price' in request body.",
      "haravan_order_remain_pay": "Missing 'haravan_order_remain_pay' in request body.",
      "haravan_order_number": "Missing 'haravan_order_number' in request body.",
      "haravan_order_status": "Missing 'haravan_order_status' in request body.",
      "haravan_order_id": "Missing 'haravan_order_id' in request body."
    };

    for (const [field, errorMessage] of Object.entries(requiredFields)) {
      if (!(field in body)) {
        throw new Error(JSON.stringify({
          error_msg: errorMessage,
          error_code: LinkQRWithRealOrderService.MISSING_FIELD
        }));
      }
    }

    const qrPayment = await this.db.qrPaymentTransaction.findUnique({
      where: { id: qrPaymentId, is_deleted: false }
    });

    if (!qrPayment) {
      throw new Error(JSON.stringify({
        error_msg: `QR with id ${qrPaymentId} not found`,
        error_code: LinkQRWithRealOrderService.NOT_FOUND
      }));
    }

    const cleanPhoneNumber = (phoneNumber) => {
      return phoneNumber ? phoneNumber.replace(/\D/g, "") : "";
    };

    const cleanedPhoneNumber = cleanPhoneNumber(qrPayment.customer_phone_number);
    if (
      cleanedPhoneNumber !== cleanPhoneNumber(body.customer_phone_number) &&
      cleanedPhoneNumber !== cleanPhoneNumber(body.customer_phone_number_billing) &&
      cleanedPhoneNumber !== cleanPhoneNumber(body.customer_phone_number_shipping)
    ) {
      throw new Error(JSON.stringify({
        error_msg: `Customer name or phone number of QR with id ${qrPaymentId} does not match`,
        error_code: LinkQRWithRealOrderService.CUSTOMER_MISMATCH
      }));
    }

    if (qrPayment.haravan_order_number !== "ORDERLATER" && qrPayment.haravan_order_number && qrPayment.haravan_order_number !== "") {
      if (qrPayment.haravan_order_number === body.haravan_order_number) {
        return;
      }

      throw new Error(JSON.stringify({
        error_msg: `QR with id ${qrPaymentId} is not order later`,
        error_code: LinkQRWithRealOrderService.ORDER_NOT_LATER
      }));
    }

    let toPayAmount = parseFloat(qrPayment.transfer_amount);
    const haravanOrderRemainPay = parseFloat(body.haravan_order_remain_pay);

    if (Math.abs(haravanOrderRemainPay - toPayAmount) <= 1000) {
      toPayAmount = haravanOrderRemainPay;
    }

    const haravanOrderId = parseInt(body.haravan_order_id, 10);
    const existingOrder = await this.db.order.findUnique({
      where: { id: haravanOrderId }
    });

    if (!existingOrder) {
      throw new Error(JSON.stringify({
        error_msg: `Order with id ${haravanOrderId} not found`,
        error_code: LinkQRWithRealOrderService.NOT_FOUND
      }));
    }

    try {
      const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();
      if (!HRV_API_KEY) {
        throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
      }

      const haravanService = new HaravanAPI(HRV_API_KEY);

      /**
       * After create transaction,
       * then update QR Payment to success
       * then update Larksuite Record to success
       */
      const createdTransactionResponse = await haravanService.orderTransaction.createTransaction(
        body.haravan_order_id,
        {
          amount: toPayAmount,
          kind: "capture",
          gateway: "Chuyển khoản ngân hàng (tự động xác nhận giao dịch)"
        }
      );

      if (createdTransactionResponse) {
        const updateQr = await this.updateOrderLater(qrPaymentId, body);
        if (!updateQr) {
          throw new Error(JSON.stringify({
            error_msg: `Failed to update order later with id ${qrPaymentId}`,
            error_code: LinkQRWithRealOrderService.INTERNAL_ERROR
          }));
        }

        await this.updateLarksuiteRecordToSuccess(qrPayment.lark_record_id);
      }
    } catch (e) {
      throw new Error(JSON.stringify({
        error_msg: `Error creating Haravan transaction: ${e.message}`,
        error_code: LinkQRWithRealOrderService.TRANSACTION_CREATION_ERROR
      }));
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
