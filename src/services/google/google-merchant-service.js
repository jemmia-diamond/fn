import GoogleAuth from "services/google/auth.js";
import * as Sentry from "@sentry/cloudflare";
import { createAxiosClient } from "services/utils/http-client";
import credentials from "services/google/credentials";

export default class GoogleMerchantService {
  constructor(env) {
    this.env = env;
    this.merchantId = env.GOOGLE_MERCHANT_ID;
    this.auth = null;
    this.client = createAxiosClient({
      baseURL: "https://merchantapi.googleapis.com",
      timeout: 10000
    });
  }

  async _ensureAuth() {
    if (this.auth) return;

    // Get private key from secret parts (handle split key)
    const p1 = await this.env.GOOGLE_MERCHANT_PRIVATE_KEY_PART1_SECRET?.get() || "";
    const p2 = await this.env.GOOGLE_MERCHANT_PRIVATE_KEY_PART2_SECRET?.get() || "";
    const p3 = await this.env.GOOGLE_MERCHANT_PRIVATE_KEY_PART3_SECRET?.get() || "";
    let privateKey = p1 + p2 + p3;

    if (privateKey && credentials) {
      try {
        if (!privateKey.includes("BEGIN PRIVATE KEY")) {
          privateKey = atob(privateKey);
        }

        credentials.private_key = privateKey;
        this.auth = new GoogleAuth(credentials);
      } catch (e) {
        Sentry.captureException(e);
      }
    }
  }

  async _getDataSourceId() {
    if (this.dataSourceId) return this.dataSourceId;

    try {
      const headers = await this._getHeaders();
      const url = `/datasources/v1beta/accounts/${this.merchantId}/dataSources`;
      const response = await this.client.get(url, { headers });

      const contentApiSource = response.data.dataSources?.find(ds => ds.displayName === "Content API");

      if (contentApiSource) {
        this.dataSourceId = contentApiSource.dataSourceId;
        return this.dataSourceId;
      }

      throw new Error("Could not find 'Content API' data source");
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  _parseCredentials(keyContent) {
    if (typeof keyContent !== "string") {
      return keyContent;
    }

    let parsed = keyContent;
    if (!parsed.trim().startsWith("{")) {
      try {
        parsed = atob(parsed);
      } catch (e) {
        Sentry.captureException(e);
        return;
      }
    }

    return JSON.parse(parsed);
  }

  async _getHeaders() {
    await this._ensureAuth();
    if (!this.auth) {
      throw new Error("Google Merchant authentication not configured");
    }
    const token = await this.auth.getAccessToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  async insertProduct(productData) {
    try {
      const headers = await this._getHeaders();
      const dataSourceId = await this._getDataSourceId();
      const url = `/products/v1beta/accounts/${this.merchantId}/productInputs:insert?dataSource=accounts/${this.merchantId}/dataSources/${dataSourceId}`;

      const response = await this.client.post(url, productData, { headers });

      return response.data;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const headers = await this._getHeaders();
      const url = `/products/v1beta/accounts/${this.merchantId}/productInputs/${productId}`;

      await this.client.delete(url, { headers });

      return true;
    } catch (error) {
      // 404 is fine to ignore for delete
      if (error.response?.status === 404) {
        return true;
      }
      Sentry.captureException(error);
      throw error;
    }
  }

  async insertProducts(products) {
    const BATCH_SIZE = 5;
    const batches = this._chunkArray(products, BATCH_SIZE);

    for (const batch of batches) {
      try {
        const results = await Promise.allSettled(
          batch.map(product => this.insertProduct(product))
        );

        const failCount = results.filter(r => r.status === "rejected").length;
        if (failCount > 0) {
          results.filter(r => r.status === "rejected").forEach(r => Sentry.captureException(r.reason));
        }
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }

  _chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
