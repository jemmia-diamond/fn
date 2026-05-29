import { createAxiosClient } from "services/utils/http-client";

export default class DokployService {
  /**
   * Triggers a Dokploy deployment
   * @param {string} deployId The Dokploy deployment ID
   */
  static async triggerComposeDeploy(deployId) {
    const client = createAxiosClient({
      baseURL: "https://dokploy.jemmia.vn",
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
