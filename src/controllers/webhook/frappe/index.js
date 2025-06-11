import verifyFrappeWebhook from "../../../auth/frappe-auth";
import FrappePancakeConversationAssignmentController from "./pancake/conversation-assignment";

export default class FrappeWebhook {
  static register(webhook) {
    const frappeWebhookNamespace = webhook.basePath("/frappe");
    frappeWebhookNamespace.use("*", verifyFrappeWebhook);
    frappeWebhookNamespace.post("/pancake/conversation_assignments", FrappePancakeConversationAssignmentController.create);
  }
}
