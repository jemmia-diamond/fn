import GoogleAuth from "services/google/auth.js";
import * as Sentry from "@sentry/cloudflare";
import { createAxiosClient } from "services/utils/http-client";

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

    const jsonKey = this.env.GOOGLE_MERCHANT_SA;

    if (jsonKey) {
      try {
        const credentials = this._parseCredentials(jsonKey);
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
      const url = `/datasources/v1/accounts/${this.merchantId}/dataSources`;
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

    try {
      return JSON.parse(keyContent);
    } catch (e) {
      Sentry.captureException(e);
      return;
    }
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
      const url = `/products/v1/accounts/${this.merchantId}/productInputs:insert?dataSource=accounts/${this.merchantId}/dataSources/${dataSourceId}`;

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
      const url = `/products/v1/accounts/${this.merchantId}/productInputs/${productId}`;

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
    try {
      const results = await Promise.allSettled(
        products.map(product => this.insertProduct(product))
      );

      const failCount = results.filter(r => r.status === "rejected").length;
      if (failCount > 0) {
        results.filter(r => r.status === "rejected").forEach(r => Sentry.captureException(r.reason));
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

}
