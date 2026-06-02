import DokployService from "services/dokploy/dokploy-service";

export default class InfisicalDokployDeployController {
  static async create(c) {
    const deployPath = c.req.param("deployPath");
    if (!deployPath) {
      return c.json({ error: "Missing deployPath" }, 400);
    }

    await DokployService.triggerDeploy(c.env, deployPath);

    return c.json({ message: "Dokploy deploy triggered successfully", deployPath }, 200);
  }
}
