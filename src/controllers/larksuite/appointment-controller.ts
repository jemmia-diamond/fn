export default class LarkAppointmentController {
  static async create(ctx) {
    const body = await ctx.req.json();

    await ctx.env["LARKSUITE_APPOINTMENT_QUEUE"].send(body);
    return ctx.json({ message: "Lark appointment webhook received", status: 200 });
  }
};
