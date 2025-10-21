import { verifyHmacBase64Auth } from "auth/hmac-base64-auth";
import FrappePancakeConversationAssignmentController from "controllers/webhook/frappe/pancake/conversation-assignment";
import FrappeERPContactsController from "controllers/webhook/frappe/erp/contacts/contacts";
import FrappeERPSalesOrderController from "controllers/webhook/frappe/erp/sales-order/sales-order";

export default class FrappeWebhook {
  static register(webhook) {
    const frappeWebhookNamespace = webhook.basePath("/frappe");
    frappeWebhookNamespace.use("*", verifyHmacBase64Auth("X-Frappe-Webhook-Signature", "FRAPPE_WEBHOOK_SECRET"));
    frappeWebhookNamespace.post("/pancake/conversation_assignments", FrappePancakeConversationAssignmentController.create);
    frappeWebhookNamespace.post("/erp/contacts", FrappeERPContactsController.create);
    frappeWebhookNamespace.post("/erp/sales-order", FrappeERPSalesOrderController.create);
  }
}
