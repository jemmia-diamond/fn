import PancakeClient from "pancake/pancake-client";
import * as Sentry from "@sentry/cloudflare";

export default class PancakeTokenRefresherService {
  constructor(env) {
    this.env = env;
    this.pancakeClient = new PancakeClient(env);
  }

  async run() {
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

      const patsConfig = { ...this.pancakeClient.pancakePatsConfig };
      let anyTokenRefreshed = false;

      for (const page of pages) {
        try {
          let needsRefresh = true;
          const currentToken = patsConfig[page.id];

          if (currentToken) {
            try {
              const testRes = await this.pancakeClient.getPageUsers(page.id);
              if (testRes === null) {
                needsRefresh = true;
              } else if (testRes && (testRes.error_code || testRes.success === false)) {
                console.warn(`Token for page ${page.id} returned error_code ${testRes.error_code || "unknown"}. Refreshing...`);
                needsRefresh = true;
              } else {
                needsRefresh = false;
              }
            } catch (err) {
              console.warn(`Test request for page ${page.id} failed, assuming expired. Error: ${err.message}`);
              needsRefresh = true;
            }
          }

          if (needsRefresh) {
            console.warn(`Generating new PAT for page ${page.id}...`);
            const pat = await this.pancakeClient.generateNewPageAccessToken(page.id);
            if (pat) {
              patsConfig[page.id] = pat;
              anyTokenRefreshed = true;
            }
          }
        } catch (err) {
          console.warn(`Failed to generate PAT for page ${page.id}:`, err);
          Sentry.captureException(err);
        }
      }

      if (!anyTokenRefreshed) {
        console.warn("No tokens needed refreshing, aborting sync to Infisical.");
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
      console.warn(`Syncing ${entries.length} valid PATs to Infisical...`);

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
