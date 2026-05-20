import AppointmentService from "services/larksuite/appointment/appointment-service";
import { responseError, responseSuccess } from "src/constants/response";

export default class LarkAppointmentController {
  static async create(ctx) {
    const body = await ctx.req.json();
    const { record_id } = body || {};

    if (!record_id) {
      return ctx.json(responseError(new Error("missing record_id in webhook body.")));
    }
    const appointmentService = AppointmentService.instance(ctx.env);
    const erpAppointment = await appointmentService.createOrUpdateAppointment(record_id);

    return ctx.json(responseSuccess(erpAppointment));
  }
};
