import PaymentServices from "services/payment";
import { BadRequestException } from "src/exception/exceptions";

export default class ManualPaymentsController {
  /**
   * Parses and type-casts payment data from a multipart form body.
   * @param {object} body - The raw body from `c.req.parseBody()`.
   * @returns {object} A cleaned and typed data object for the service layer.
   * @private
   */
  static _parseAndTypecast(body) {
    const paymentData = { ...body };

    const amountStr = body.transfer_amount;
    if (amountStr != null && amountStr !== "") {
      paymentData.transfer_amount = parseFloat(amountStr);
    } else {
      delete paymentData.transfer_amount;
    }

    ["send_date", "receive_date", "created_date", "updated_date"].forEach(field => {
      const dateStr = body[field];
      if (dateStr != null && dateStr !== "") {
        paymentData[field] = new Date(dateStr);
      } else {
        delete paymentData[field];
      }
    });

    if (body.misa_synced != null) {
      paymentData.misa_synced = body.misa_synced === "true";
    } else {
      delete paymentData.misa_synced;
    }

    Object.keys(paymentData).forEach(key => {
      const value = paymentData[key];
      if (value === undefined || (value instanceof Date && isNaN(value.getTime())) || (typeof value === "number" && isNaN(value))) {
        delete paymentData[key];
      }
    });

    return paymentData;
  }

  static async create(c) {
    try {
      const body = await c.req.parseBody();

      const paymentData = ManualPaymentsController._parseAndTypecast(body);

      const newPayment = await PaymentServices.ManualPaymentService.createManualPayment(c.env, paymentData);

      if (newPayment) {
        return c.json(newPayment, 201);
      } else {
        return c.json({ error: "Failed to create payment" }, 500);
      }
    } catch (error) {
      console.error("Error in PaymentController.create:", error);
      return c.json({ error: "An unexpected error occurred" }, 500);
    }
  }

  static async update(c) {
    try {
      const { id } = c.req.param();
      if (!id) {
        return c.json({ error: "Missing 'id' parameter in URL" }, 400);
      }
      const body = await c.req.parseBody();

      const paymentData = ManualPaymentsController._parseAndTypecast(body);

      const updatedPayment = await PaymentServices.ManualPaymentService.updateManualPayment(
        c.env,
        id,
        paymentData
      );

      if (updatedPayment) {
        return c.json(updatedPayment, 200);
      } else {
        return c.json({ error: "Payment not found or update failed" }, 404);
      }
    } catch (error) {
      console.error("Error in PaymentController.update:", error);

      if (error instanceof BadRequestException) {
        return c.json({ error: error.message }, error.statusCode);
      }

      return c.json({ error: "An unexpected error occurred" }, 500);
    }
  }
}
