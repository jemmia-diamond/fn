import DokployService from "services/dokploy/dokploy-service";

export default class InfisicalDokployDeployController {
  static async deploy(c) {
    const deployId = c.req.param("deployId");
    if (!deployId) {
      return c.json({ error: "Missing deployId" }, 400);
    }

    await DokployService.triggerComposeDeploy(c.env, deployId);

    return c.json({ message: "Dokploy deploy triggered successfully", deployPath: `compose/${deployId}` }, 200);
  }
}
