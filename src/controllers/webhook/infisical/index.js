import InfisicalDokployDeployController from "controllers/webhook/infisical/dokploy-deploy";

export default class InfisicalWebhook {
  static register(webhook) {
    const infisicalWebhookNamespace = webhook.basePath("/infisical");
    infisicalWebhookNamespace.post("/dokploy/compose/:deployId", InfisicalDokployDeployController.deploy);
  }
}
