// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import ERP from "../controllers/erp";

export default class WebhookRoutes {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const jemmiaERPNamespaceApi = webhook.basePath("/erp");
    jemmiaERPNamespaceApi.post("/orders", ERP.OrderWebhookController.create);
  };
};
