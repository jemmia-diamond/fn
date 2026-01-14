import GoogleAuth from "services/google/auth.js";
import * as Sentry from "@sentry/cloudflare";

export default class GoogleMerchantService {
  constructor(env) {
    this.env = env;
    this.merchantId = env.GOOGLE_MERCHANT_ID;
    this.auth = null;
  }

  async _ensureAuth() {
    if (this.auth) return;

    const jsonKey = await this.env.GOOGLE_MERCHANT_SA_SECRET.get();

    if (jsonKey) {
      try {
        const credentials = this._parseCredentials(jsonKey);
        this.auth = new GoogleAuth(credentials);
      } catch (e) {
        Sentry.captureException(e);
      }
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
      const url = `https://shoppingcontent.googleapis.com/content/v2.1/${this.merchantId}/products`;

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Merchant API Error: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const headers = await this._getHeaders();
      const url = `https://shoppingcontent.googleapis.com/content/v2.1/${this.merchantId}/products/${productId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: headers
      });

      if (!response.ok) {
        // 404 is fine to ignore for delete
        if (response.status === 404) {
          return true;
        }
        const errorText = await response.text();
        throw new Error(`Google Merchant API Error: ${response.status} ${errorText}`);
      }

      return true;
    } catch (error) {
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
