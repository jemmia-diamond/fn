import ERPNextCRMAppointmentService from "services/erp/crm/appointment/appointment";
import Pancake from "services/pancake";

export default class CRMService {
  static async dequeueCRMQueue(batch, env) {
    const body = batch.messages[0].body;
    const payload = body?.data || body;
    const event = body?.event;

    switch (payload.doctype) {
      case "Appointment":
        await new ERPNextCRMAppointmentService(env).syncAppointment(
          payload,
          event
        );
        break;
      case "Lead":
        await new Pancake.ConversationAssignmentService(
          env
        ).syncConversationAssigneesWithLeadOwner(payload);
        break;
      default:
        break;
    }
  }
}
