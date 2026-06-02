import { createAxiosClient } from "services/utils/http-client";

export default class DokployService {
  /**
   * Triggers a Dokploy deployment
   * @param {Object} env Cloudflare environment bindings
   * @param {string} deployId The Dokploy deployment ID
   */
  static async triggerComposeDeploy(env, deployId) {
    const baseURL = env.DOKPLOY_BASE_URL || "https://dokploy.jemmia.vn";
    const client = createAxiosClient({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": "push"
      }
    });

    const response = await client.post(`/api/deploy/compose/${deployId}`, {
      ref: "refs/heads/main"
    });

    return response.data;
  }
}
