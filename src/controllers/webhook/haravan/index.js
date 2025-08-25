import HaravanERPOrderController from "controllers/webhook/haravan/erp/order";

export default class HaravanWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  haravanWebhookNamespace = webhook.basePath("/haravan");
    
    haravanWebhookNamespace.use("*", verifyHmacBase64Auth("X-Haravan-Hmacsha256", "HARAVAN_WEBHOOK_SECRET"));
    haravanWebhookNamespace.post("erp/orders", HaravanERPOrderController.create);
    
  };
};
