import { verifyHmacBase64Auth } from "../../../auth/hmac-base64-auth";
import HaravanERPOrderController from "../haravan/erp/order";

export default class HaravanWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  haravanWebhookNamespace = webhook.basePath("/haravan");
    
    haravanWebhookNamespace.use("*", verifyHmacBase64Auth("X-Haravan-Hmac-Sha256", "HARAVAN_WEBHOOK_SECRET"));
    haravanWebhookNamespace.post("erp/orders", HaravanERPOrderController.create);
    
  };
};
