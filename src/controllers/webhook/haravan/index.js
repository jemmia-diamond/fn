import verifyHaravanWebhook from "../../../auth/haravan-auth";
import HaravanERPOrderController from "../haravan/erp/order";

export default class HaravanWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  haravanWebhookNamespace = webhook.basePath("/haravan");
    
    haravanWebhookNamespace.use("*", verifyHaravanWebhook);
    haravanWebhookNamespace.post("erp/orders", HaravanERPOrderController.create);
    
  };
};
