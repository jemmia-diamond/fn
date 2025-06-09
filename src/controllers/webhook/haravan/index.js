import verifyHaravanWebhook from "../../../auth/haravan-auth";
import OrderController from "../erp/order";

export default class HaravanWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  haravanWebhookNamespace = webhook.basePath("/haravan");
    
    haravanWebhookNamespace.use("*", verifyHaravanWebhook);
    haravanWebhookNamespace.post("/orders", OrderController.create);
    
  };
};
