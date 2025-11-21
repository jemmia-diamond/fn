import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import PaymentService from "services/payment";
dayjs.extend(utc);

export default class QRPaymentsController {

  static preProcessQRRequest(body) {
    return {
      bank_code: body.bank_code,
      bank_account_number: body.bank_account_number,
      bank_account_name: body.bank_account_name,
      bank_bin: body.bank_bin,
      bank_name: body.bank_name,
      customer_name: body.customer_name,
      customer_phone_number: body.customer_phone_number,
      transfer_amount: body.transfer_amount,
      haravan_order_total_price: body.haravan_order_total_price,
      haravan_order_number: body.haravan_order_number,
      haravan_order_status: body.haravan_order_status,
      haravan_order_id: parseInt(body.haravan_order_id, 10),
      lark_record_id: body.lark_record_id,
      customer_phone_order_later: body.customer_phone_order_later,
      customer_name_order_later: body.customer_name_order_later
    };
  }

  static async create(c) {
    try {
      const body = await c.req.json();

      const qrData = QRPaymentsController.preProcessQRRequest(body);

      const createQRService = new PaymentService.CreateQRService(c.env);

      const createdQR = await createQRService.handlePostQr(qrData);

      if (createdQR) {
        return c.json(QRPaymentsController._serializePayment(createdQR), 201);
      } else {
        return c.json({ error: "Failed to create QR" }, 500);
      }
    } catch (error) {
      Sentry.captureException(error);
      return c.json({ error: "An unexpected error occurred" }, 500);
    }
  }

  static _serializePayment(payment) {
    if (!payment) {
      return null;
    }
    // haravan_order_id
    const serializableData = { ...payment };
    if (serializableData.haravan_order_id != null) {
      serializableData.haravan_order_id = serializableData.haravan_order_id.toString();
    }
    // transfer_amount
    if (serializableData.transfer_amount != null) {
      serializableData.transfer_amount = parseFloat(serializableData.transfer_amount);
    }
    // haravan_order_total_price
    if (serializableData.haravan_order_total_price != null) {
      serializableData.haravan_order_total_price = parseFloat(serializableData.haravan_order_total_price);
    }
    return serializableData;
  }
}
