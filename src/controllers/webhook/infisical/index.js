import { verifyInfisicalAuth } from "auth/infisical-auth";
import InfisicalDokployDeployController from "controllers/webhook/infisical/dokploy-deploy";

export default class InfisicalWebhook {
  static register(webhook) {
    const infisicalWebhookNamespace = webhook.basePath("/infisical");
    infisicalWebhookNamespace.use(
      "*",
      verifyInfisicalAuth("x-infisical-signature", "INFISICAL_WEBHOOK_SECRET")
    );
    infisicalWebhookNamespace.post(
      "/dokploy/:deployPath{.*}",
      InfisicalDokployDeployController.create
    );
  }
}
