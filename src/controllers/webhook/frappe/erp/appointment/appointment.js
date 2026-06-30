export default class FrappeERPAppointmentController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const event = ctx.req.header("Frappe-Webhook-Event");
    await ctx.env["ERPNEXT_CRM_QUEUE"].send({ data, event });

    return ctx.json({ message: "Appointment webhook received", status: 200 });
  }
}
