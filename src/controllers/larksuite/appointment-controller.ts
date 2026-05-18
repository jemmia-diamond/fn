import AppointmentService from "services/larksuite/appointment/appointment-service";

export default class LarkAppointmentController {
  static async create(ctx) {
    const body = await ctx.req.json();
    const { token, app_token, table_id, record_id } = body || {};
    const expectedToken = await ctx.env.BEARER_TOKEN;
    if (token !== expectedToken) {
      return ctx.json({
        code: 1,
        msg: "invalid token",
        data: {}
      });
    }

    const appToken = app_token || ctx.env.LARK_APPOINTMENT_APP_TOKEN;
    const tableId = table_id || ctx.env.LARK_APPOINTMENT_TABLE_ID;

    if (!appToken || !tableId || !record_id) {
      return ctx.json({
        code: 2,
        msg: "missing app_token, table_id, or record_id. Please provide them in the webhook body or environment variables.",
        data: {}
      });
    }
    const appointmentService = AppointmentService.instance(ctx.env);
    const erpAppointment = await appointmentService.createOrUpdateAppointment(appToken, tableId, record_id);

    return ctx.json({
      code: 0,
      msg: "success",
      data: {
        result: erpAppointment
      }
    });
  }
};
