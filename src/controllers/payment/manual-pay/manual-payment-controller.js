import PaymentService from "services/payment";

export default class ManualPaymentController {
  static async create(c) {
    try {
      const body = await c.req.json();
      const newPayment = await PaymentService.ManualPaymentService.createManualPayment(c.env, body);

      if (newPayment) {
        return c.json(newPayment, 201);
      } else {
        return c.json({ error: "Failed to create payment" }, 500);
      }
    } catch (error) {
      console.error("Error in PaymentController.create:", error);
      if (error instanceof SyntaxError) {
        return c.json({ error: "Invalid JSON in request body" }, 400);
      }
      return c.json({ error: "An unexpected error occurred" }, 500);
    }
  }

  static async update(c) {
    try {
      const { uuid } = c.req.param();
      if (!uuid) {
        return c.json({ error: "Missing 'uuid' parameter in URL" }, 400);
      }
      const body = await c.req.json();

      const updatedPayment = await ManualPaymentService.updateManualPayment(c.env, uuid, body);

      if (updatedPayment) {
        return c.json(updatedPayment, 200);
      } else {
        return c.json({ error: "Payment not found or update failed" }, 404);
      }
    } catch (error) {
      console.error("Error in PaymentController.update:", error);
      if (error instanceof SyntaxError) {
        return c.json({ error: "Invalid JSON in request body" }, 400);
      }
      return c.json({ error: "An unexpected error occurred" }, 500);
    }
  }
}

