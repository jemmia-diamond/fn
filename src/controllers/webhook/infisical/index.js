import InfisicalDokployDeployController from "controllers/webhook/infisical/dokploy-deploy";
import { verifyInfisicalAuth } from "auth/infisical-auth";

export default class InfisicalWebhook {
  static register(webhook) {
    const infisicalWebhookNamespace = webhook.basePath("/infisical");
    infisicalWebhookNamespace.use("*", verifyInfisicalAuth("x-infisical-signature", "INFISICAL_WEBHOOK_SECRET"));
    infisicalWebhookNamespace.post("/dokploy/compose/:deployId", InfisicalDokployDeployController.create);
  }
}
