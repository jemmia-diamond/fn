import * as Sentry from "@sentry/cloudflare";
import PancakeClient from "pancake/pancake-client";

export default class PancakeTokenRefresherService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env);
  }

  async run() {
    const tokenRefresh = await this.env.FN_KV.get("PANCAKE_TOKEN_REFRESH");
    if (tokenRefresh == "-1") {
      return;
    }
    try {
      console.warn("Starting Pancake Token Refresher...");

      const pagesResponse = await this.pancakeClient.getPages();
      const categorized = pagesResponse?.categorized;
      const pages = [
        ...(categorized?.activated || []),
        ...(categorized?.inactivated || [])
      ];

      if (!pages.length) {
        console.warn("No Pancake pages found to refresh tokens for.");
        return;
      }

      const patsConfig = {};
      for (const page of pages) {
        try {
          const pat = await this.pancakeClient.generateNewPageAccessToken(page.id);
          if (pat) {
            patsConfig[page.id] = pat;
          }
        } catch (err) {
          console.warn(`Failed to generate PAT for page ${page.id}:`, err);
          Sentry.captureException(err);
        }
      }

      if (Object.keys(patsConfig).length === 0) {
        console.warn("Failed to generate any new PATs, aborting sync to Infisical.");
        return;
      }

      const infisicalApiUrl = this.env.INFISICAL_API_URL || "https://infisical.jemmia.vn";
      const accessToken = this.env.INFISICAL_TOKEN;
      const projectId = this.env.INFISICAL_PROJECT_ID;
      const environment = this.env.INFISICAL_ENVIRONMENT || "prod";

      if (!accessToken || !projectId) {
        throw new Error("Missing required Infisical environment variables (INFISICAL_TOKEN, INFISICAL_PROJECT_ID).");
      }

      const entries = Object.entries(patsConfig);
      console.warn(`Generated ${entries.length} new PATs. Syncing to Infisical...`);

      const CHUNK_SIZE = 20;
      let chunkIndex = 1;

      for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
        const chunk = Object.fromEntries(entries.slice(i, i + CHUNK_SIZE));
        const secretName = `PANCAKE_PATS_CONFIG_${chunkIndex}`;
        const secretValue = JSON.stringify(chunk);

        const body = JSON.stringify({
          workspaceId: projectId,
          environment: environment,
          secretPath: "/commons",
          secretValue: secretValue
        });

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        };

        let res = await fetch(`${infisicalApiUrl}/api/v3/secrets/raw/${secretName}`, {
          method: "PATCH",
          headers,
          body
        });

        if (res.status === 404 || res.status === 400) {
          res = await fetch(`${infisicalApiUrl}/api/v3/secrets/raw/${secretName}`, {
            method: "POST",
            headers,
            body
          });
        }

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to upsert secret ${secretName} in Infisical: ${res.status} - ${errorText}`);
        }

        console.warn(`Successfully updated ${secretName} in Infisical.`);
        chunkIndex++;
      }
    } catch (error) {
      console.warn("Error running Pancake Token Refresher:", error);
      Sentry.captureException(error);
    }
  }
}
