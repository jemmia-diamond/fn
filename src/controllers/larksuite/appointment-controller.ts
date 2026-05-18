import AppointmentService from "services/larksuite/appointment/appointment-service";
import { RESPONSE_INVALID_TOKEN, responseError, responseSuccess } from "src/constants/response";

export default class LarkAppointmentController {
  static async create(ctx) {
    const body = await ctx.req.json();
    const { token, record_id } = body || {};
    const expectedToken = await ctx.env.BEARER_TOKEN;
    if (token !== expectedToken) {
      return ctx.json(RESPONSE_INVALID_TOKEN);
    }

    const appToken = ctx.env.LARK_APPOINTMENT_APP_TOKEN;
    const tableId = ctx.env.LARK_APPOINTMENT_TABLE_ID;

    if (!appToken || !tableId || !record_id) {
      return ctx.json(responseError(new Error("missing app_token, table_id, or record_id. Please provide them in the webhook body or environment variables.")));
    }
    const appointmentService = AppointmentService.instance(ctx.env);
    const erpAppointment = await appointmentService.createOrUpdateAppointment(appToken, tableId, record_id);

    return ctx.json(responseSuccess(erpAppointment));
  }
};
