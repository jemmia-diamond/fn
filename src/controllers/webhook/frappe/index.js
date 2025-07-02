import { verifyHmacBase64Auth } from "../../../auth/hmac-base64-auth";
import FrappePancakeConversationAssignmentController from "./pancake/conversation-assignment";

export default class FrappeWebhook {
  static register(webhook) {
    const frappeWebhookNamespace = webhook.basePath("/frappe");
    // frappeWebhookNamespace.use("*", verifyHmacBase64Auth("X-Frappe-Webhook-Signature", "FRAPPE_WEBHOOK_SECRET"));
    frappeWebhookNamespace.post("/pancake/conversation_assignments", FrappePancakeConversationAssignmentController.create);
  }
}
