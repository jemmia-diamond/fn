import ERPNextCRMAppointmentService from "services/erp/crm/appointment/appointment";
export default class CRMService {
  static async dequeueCRMQueue(batch, env) {
    const body = batch.messages[0].body;
    const payload = body?.data || body;
    const event = body?.event;

    switch (payload.doctype) {
    case "Appointment":
      await ERPNextCRMAppointmentService.syncAppointment(payload, event, env);
      break;
    default:
      break;
    }
  }
}
