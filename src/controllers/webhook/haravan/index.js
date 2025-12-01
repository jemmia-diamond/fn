import { verifyHmacBase64Auth } from "auth/hmac-base64-auth";
import HaravanERPOrderController from "controllers/webhook/haravan/erp/order";
import HaravanNocoProductController from "controllers/webhook/haravan/noco/product";

export default class HaravanWebhook {
  static register(webhook) {
    /*
    /webhook/namespace/resources
    */
    const  haravanWebhookNamespace = webhook.basePath("/haravan");

    haravanWebhookNamespace.use("*", verifyHmacBase64Auth("X-Haravan-Hmacsha256", "HARAVAN_WEBHOOK_SECRET"));
    haravanWebhookNamespace.post("erp/orders", HaravanERPOrderController.create);
    haravanWebhookNamespace.post("noco/products",  HaravanNocoProductController.create);
  };
};
