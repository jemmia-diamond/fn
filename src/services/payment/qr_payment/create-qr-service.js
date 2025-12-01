import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";

dayjs.extend(utc);

export default class CreateQRService {
  static MISSING_REQUEST_BODY = "MISSING_REQUEST_BODY";
  static MISSING_FIELD = "MISSING_FIELD";
  static PRICE_OVER_LIMIT = "PRICE_OVER_LIMIT";

  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  /**
   * Formats the Quick QR URL.
   * @param {Object} params - The parameters for the QR code.
   * @param {string} params.bankAccountNumber - The bank account number.
   * @param {string} params.bankBin - The bank BIN.
   * @param {number|string} params.transferAmount - The transfer amount.
   * @param {string} params.transferNote - The transfer note.
   * @returns {string} - The formatted QR URL.
   */
  static formatQuickQrUrl({ bankAccountNumber, bankBin, transferAmount, transferNote }) {
    const params = new URLSearchParams({
      acc: bankAccountNumber,
      bank: bankBin,
      amount: transferAmount.toString(),
      des: transferNote,
      template: "",
      download: "no"
    });
    const baseUrl = "https://qr.sepay.vn/img";
    return `${baseUrl}?${params.toString()}`;
  }

  async handlePostQr(body) {
    if (!body) {
      throw new Error(JSON.stringify({ error_msg: "Missing request body.", error_code: CreateQRService.MISSING_REQUEST_BODY }));
    }

    const requiredFields = {
      "bank_code": "Missing 'bank_code' in request body.",
      "bank_account_number": "Missing 'bank_account_number' in request body.",
      "bank_account_name": "Missing 'bank_account_name' in request body.",
      "bank_bin": "Missing 'bank_bin' in request body.",
      "bank_name": "Missing 'bank_name' in request body.",
      "customer_name": "Missing 'customer_name' in request body.",
      "customer_phone_number": "Missing 'customer_phone_number' in request body.",
      "transfer_amount": "Missing 'transfer_amount' in request body.",
      "haravan_order_total_price": "Missing 'haravan_order_total_price' in request body.",
      "haravan_order_number": "Missing 'haravan_order_number' in request body.",
      "haravan_order_status": "Missing 'haravan_order_status' in request body.",
      "haravan_order_id": "Missing 'haravan_order_id' in request body."
    };

    const isOrderLater = body.haravan_order_number === "Đơn hàng cọc";

    if (isOrderLater) {
      if (!body.customer_phone_order_later) {
        throw new Error(JSON.stringify({ error_msg: "'customer_phone_order_later' cannot be empty for 'Đơn hàng cọc' order", error_code: CreateQRService.MISSING_FIELD }));
      }
      if (!body.customer_name_order_later) {
        throw new Error(JSON.stringify({ error_msg: "'customer_name_order_later' cannot be empty for 'Đơn hàng cọc' order", error_code: CreateQRService.MISSING_FIELD }));
      }
      if (!body.transfer_amount) {
        throw new Error(JSON.stringify({ error_msg: "'transfer_amount' cannot be empty for 'Đơn hàng cọc' order", error_code: CreateQRService.MISSING_FIELD }));
      }
    } else {
      for (const [field, errorMessage] of Object.entries(requiredFields)) {
        if (!(field in body)) {
          throw new Error(JSON.stringify({ error_msg: errorMessage, error_code: CreateQRService.MISSING_FIELD }));
        }
      }

      if (parseFloat(body.transfer_amount) > parseFloat(body.haravan_order_total_price)) {
        throw new Error(JSON.stringify({ error_msg: "Transfer amount cannot be greater than order total price", error_code: CreateQRService.PRICE_OVER_LIMIT }));
      }
    }

    let description = "";
    if (isOrderLater) {
      description = body.bank_code === "icb" ? "SEVQR ORDERLATER" : "ORDERLATER";
    } else {
      description = body.bank_code === "icb" ? `SEVQR ${body.haravan_order_number}` : body.haravan_order_number;
    }

    const nowUtc = dayjs.utc();
    const untilUnix = nowUtc.unix();
    description = `${description} ${untilUnix}`;

    const transactionBody = {
      transfer_status: "pending",
      transfer_note: description,
      bank_account_number: body.bank_account_number,
      bank_code: body.bank_code,
      transfer_amount: body.transfer_amount,
      lark_record_id: body.lark_record_id || "",
      haravan_order_number: isOrderLater ? "ORDERLATER" : body.haravan_order_number,
      customer_name: isOrderLater ? body.customer_name_order_later : body.customer_name,
      customer_phone_number: isOrderLater ? body.customer_phone_order_later : body.customer_phone_number
    };

    if (!isOrderLater) {
      transactionBody.haravan_order_id = parseInt(body.haravan_order_id);
      transactionBody.haravan_order_status = body.haravan_order_status;
      transactionBody.haravan_order_total_price = body.haravan_order_total_price;
    }

    if (body.payment_entry_name) {
      transactionBody.payment_entry_name = body.payment_entry_name;
    }

    const qrUrl = CreateQRService.formatQuickQrUrl({
      bankAccountNumber: transactionBody.bank_account_number,
      bankBin: body.bank_bin,
      transferAmount: transactionBody.transfer_amount,
      transferNote: description
    });
    transactionBody.qr_url = qrUrl;

    return await this.db.qrPaymentTransaction.create({
      data: transactionBody
    });
  }
}
