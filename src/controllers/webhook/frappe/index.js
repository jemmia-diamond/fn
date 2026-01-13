import { verifyHmacBase64Auth } from "auth/hmac-base64-auth";
import FrappePancakeConversationAssignmentController from "controllers/webhook/frappe/pancake/conversation-assignment";
import FrappeERPContactsController from "controllers/webhook/frappe/erp/contacts/contacts";
import FrappeERPSalesOrderController from "controllers/webhook/frappe/erp/sales-order/sales-order";
import FrappeERPPaymentEntryController from "controllers/webhook/frappe/erp/payment-entry/payment-entry";
import FrappeERPCustomerController from "controllers/webhook/frappe/erp/customer/customer";
import FrappeERPSalesOrderItemController from "controllers/webhook/frappe/erp/sales-order-item/sales-order-item";

export default class FrappeWebhook {
  static register(webhook) {
    const frappeWebhookNamespace = webhook.basePath("/frappe");
    frappeWebhookNamespace.use("*", verifyHmacBase64Auth("X-Frappe-Webhook-Signature", "FRAPPE_WEBHOOK_SECRET"));
    frappeWebhookNamespace.post("/pancake/conversation_assignments", FrappePancakeConversationAssignmentController.create);
    frappeWebhookNamespace.post("/erp/contacts", FrappeERPContactsController.create);
    frappeWebhookNamespace.post("/erp/sales-orders", FrappeERPSalesOrderController.create);
    frappeWebhookNamespace.post("/erp/payment-entries", FrappeERPPaymentEntryController.create);
    frappeWebhookNamespace.post("/erp/customers", FrappeERPCustomerController.create);
    frappeWebhookNamespace.post("/erp/sales-order-items", FrappeERPSalesOrderItemController.create);
  }
}
