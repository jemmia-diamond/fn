// TODO: Make this import dynamic, so that we can add new controllers without repeating ourselves.
import Webhook from "../controllers/webhooks";

export default class WebhookRoutes {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const jemmiaERPNamespaceApi = webhook.basePath("/erp");
    jemmiaERPNamespaceApi.post("/orders", Webhook.ERP.OrderController.create);
  };
};
