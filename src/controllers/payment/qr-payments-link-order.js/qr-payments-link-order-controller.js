import PaymentService from "services/payment";

export default class QRPaymentsLinkOrderController {

  static async create(c) {
    const { id } = c.req.param();
    if (!id) {
      return c.json({ error: "Missing 'id' parameter in URL" }, 400);
    }
    const body = await c.req.json();

    if (!body || typeof body !== "object") {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const paymentService = new PaymentService.LinkQRWithRealOrderService(c.env);

    await paymentService.mapTransaction(id, body);

    return c.json({ success: true });
  }
}
