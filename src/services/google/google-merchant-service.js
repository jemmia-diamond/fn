import GoogleAuth from "services/google/auth.js";

import defaultCredentials from "services/google/jemmia-merchant-api-bf1a1f2060ca.json";

export default class GoogleMerchantService {
  constructor(env) {
    this.env = env;
    this.merchantId = env.GOOGLE_MERCHANT_ID;
    this.auth = null;

    if (env.GOOGLE_MERCHANT_JSON_KEY) {
      try {
        const credentials = typeof env.GOOGLE_MERCHANT_JSON_KEY === "string"
          ? JSON.parse(env.GOOGLE_MERCHANT_JSON_KEY)
          : env.GOOGLE_MERCHANT_JSON_KEY;
        this.auth = new GoogleAuth(credentials);
      } catch (e) {
        console.warn("Failed to parse GOOGLE_MERCHANT_JSON_KEY", e);
      }
    } else {
      // Fallback to local file for dev
      console.warn("Using local credentials file for Google Merchant auth");
      this.auth = new GoogleAuth(defaultCredentials);
    }
  }

  async _getHeaders() {
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
      console.warn("Product uploaded successfully:", responseData.id);
      return responseData;
    } catch (error) {
      console.warn("Error uploading product:", error);
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
          console.warn("Product not found, delete skipped:", productId);
          return true;
        }
        const errorText = await response.text();
        throw new Error(`Google Merchant API Error: ${response.status} ${errorText}`);
      }

      console.warn("Product deleted successfully:", productId);
      return true;
    } catch (error) {
      console.warn("Error deleting product:", error);
      throw error;
    }
  }

  async insertProducts(products) {
    // Re-using the same batch logic but now calling the REST-based insertProduct
    const BATCH_SIZE = 50; // Reduced batch size for fetch concurrency control
    const batches = this._chunkArray(products, BATCH_SIZE);

    console.warn(`Starting sync for ${products.length} products in ${batches.length} batches...`);

    for (const batch of batches) {
      try {
        const results = await Promise.allSettled(
          batch.map(product => this.insertProduct(product))
        );

        const successCount = results.filter(r => r.status === "fulfilled").length;
        const failCount = results.filter(r => r.status === "rejected").length;

        console.warn(`Batch processed: ${successCount} success, ${failCount} failed.`);
      } catch (error) {
        console.warn("Batch failed:", error);
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
