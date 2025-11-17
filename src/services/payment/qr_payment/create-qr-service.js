import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import Database from "services/database";
import OrderTransactionClient from "services/haravan/api-client/modules/order-transactions/order-transaction-client";

dayjs.extend(utc);

function url_quick_qr_format({ bank_account_number, bank_bin, transfer_amount, transfer_note }) {
  const params = new URLSearchParams({
    acc: bank_account_number,
    bank: bank_bin,
    amount: transfer_amount.toString(),
    des: transfer_note,
    template: "",
    download: "no"
  });
  const base_url = "https://qr.sepay.vn/img";
  return `${base_url}?${params.toString()}`;
}

const MISSING_REQUEST_BODY = "MISSING_REQUEST_BODY";
const MISSING_FIELD = "MISSING_FIELD";
const PRICE_OVER_LIMIT = "PRICE_OVER_LIMIT";

export default class CreateQRService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.transactionConnector = new OrderTransactionClient(env);
  }

  async handle_post_qr(body) {
    if (!body) {
      throw new Error(JSON.stringify({ error_msg: "Missing request body.", error_code: MISSING_REQUEST_BODY }));
    }

    const required_fields = {
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
      "haravan_order_id": "Missing 'haravan_order_id' in request body.",
      "lark_record_id": "Missing 'lark_record_id' in request body."
    };

    let is_order_later = false;

    if (body.haravan_order_number === "Đơn hàng cọc") {
      is_order_later = true;

      if (!body.customer_phone_order_later) {
        throw new Error(JSON.stringify({ error_msg: "'customer_phone_order_later' cannot be empty for 'Đơn hàng cọc' order", error_code: MISSING_FIELD }));
      }
      if (!body.customer_name_order_later) {
        throw new Error(JSON.stringify({ error_msg: "'customer_name_order_later' cannot be empty for 'Đơn hàng cọc' order", error_code: MISSING_FIELD }));
      }
      if (!body.transfer_amount) {
        throw new Error(JSON.stringify({ error_msg: "'transfer_amount' cannot be empty for 'Đơn hàng cọc' order", error_code: MISSING_FIELD }));
      }

    } else {
      for (const [field, error_message] of Object.entries(required_fields)) {
        if (!(field in body)) {
          throw new Error(JSON.stringify({ error_msg: error_message, error_code: MISSING_FIELD }));
        }
      }

      if (parseFloat(body.transfer_amount) > parseFloat(body.haravan_order_total_price)) {
        throw new Error(JSON.stringify({ error_msg: "Transfer amount cannot be greater than order total price", error_code: PRICE_OVER_LIMIT }));
      }
    }

    let description = "";

    if (body.bank_code === "icb") {
      description = `SEVQR ${body.haravan_order_number}`;
    } else {
      description = body.haravan_order_number;
    }

    if (is_order_later) {
      description = body.bank_code === "icb" ? "SEVQR ORDERLATER" : "ORDERLATER";
    }

    if (!is_order_later) {
      const now_utc = dayjs.utc();
      const until_unix = now_utc.unix();
      description = `${description} ${until_unix}`;

      const order_transaction_body = {
        transfer_status: "pending",
        transfer_note: description,
        bank_account_number: body.bank_account_number,
        bank_code: body.bank_code,
        transfer_amount: body.transfer_amount,
        lark_record_id: body.lark_record_id,
        haravan_order_number: body.haravan_order_number,
        customer_name: body.customer_name,
        customer_phone_number: body.customer_phone_number
      };

      const qr_url = url_quick_qr_format({
        bank_account_number: order_transaction_body.bank_account_number,
        bank_bin: body.bank_bin,
        transfer_amount: order_transaction_body.transfer_amount,
        transfer_note: order_transaction_body.description
      });
      order_transaction_body.qr_url = qr_url;

      return await this.db.qrPaymentTransaction.create({
        data: order_transaction_body
      });
    }

    const now_utc = dayjs.utc();
    const until_unix = now_utc.unix();
    description = `${description} ${until_unix}`;

    const order_later_transaction_body = {
      transfer_status: "pending",
      transfer_note: description,
      bank_account_number: body.bank_account_number,
      bank_code: body.bank_code,
      transfer_amount: body.transfer_amount,
      lark_record_id: body.lark_record_id,
      haravan_order_number: "ORDERLATER",
      customer_name: body.customer_name_order_later,
      customer_phone_number: body.customer_phone_order_later
    };

    const qr_url = url_quick_qr_format({
      bank_account_number: order_later_transaction_body.bank_account_number,
      bank_bin: body.bank_bin,
      transfer_amount: order_later_transaction_body.transfer_amount,
      transfer_note: description
    });
    order_later_transaction_body.qr_url = qr_url;

    return await this.db.qrPaymentTransaction.create({
      data: {
        ...order_later_transaction_body
      }
    });
  }
}
