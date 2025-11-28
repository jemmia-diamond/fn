import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import PaymentService from "services/payment";
dayjs.extend(utc);

export default class QRPaymentsMapSepayController {

  static async create(c) {
    const { id } = c.req.param();
    if (!id) {
      return c.json({ error: "Missing 'id' parameter in URL" }, 400);
    }
    const body = await c.req.json();

    if (!body || typeof body !== "object") {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const { sepay_transaction_id } = body;

    if (!sepay_transaction_id) {
      return c.json({ error: "Missing 'sepay_transaction_id' in request body" }, 400);
    }

    const paymentService = new PaymentService.MapQRWithBankTransactionService(c.env);

    await paymentService.mapTransaction(id, sepay_transaction_id);

    return c.json({ success: true });
  }
}
