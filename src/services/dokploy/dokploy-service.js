import { createAxiosClient } from "services/utils/http-client";

export default class DokployService {
  /**
   * Triggers a Dokploy deployment
   * @param {Object} env Cloudflare environment bindings
   * @param {string} deployPath The Dokploy deployment path (e.g., 'compose/123' or '123')
   */
  static async triggerDeploy(env, deployPath) {
    const baseURL = env.DOKPLOY_BASE_URL || "https://dokploy.jemmia.vn";
    const client = createAxiosClient({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": "push"
      }
    });

    const response = await client.post(`/api/deploy/${deployPath}`, {
      ref: "refs/heads/main"
    });

    return response.data;
  }
}
