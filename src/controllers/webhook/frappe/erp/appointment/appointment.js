export default class FrappeERPAppointmentController {
  static async create(ctx) {
    const data = await ctx.req.json();
    const erpTopic = ctx.req.header("erp-topic");
    await ctx.env["ERPNEXT_CRM_QUEUE"].send({ data, erpTopic });

    return ctx.json({ message: "Appointment webhook received", status: 200 });
  }
}
