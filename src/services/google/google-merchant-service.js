import { ProductsServiceClient } from "@google-shopping/products";

export default class GoogleMerchantService {
  constructor(env) {
    this.env = env;
    this.merchantId = env.GOOGLE_MERCHANT_ID;

    const options = {};
    if (env.GOOGLE_MERCHANT_JSON_KEY) {
      try {
        options.credentials = typeof env.GOOGLE_MERCHANT_JSON_KEY === "string"
          ? JSON.parse(env.GOOGLE_MERCHANT_JSON_KEY)
          : env.GOOGLE_MERCHANT_JSON_KEY;
      } catch (e) {
        console.warn("Failed to parse GOOGLE_MERCHANT_JSON_KEY", e);
      }
    } else if (env.GOOGLE_MERCHANT_JSON_KEY_PATH) {
      options.keyFilename = env.GOOGLE_MERCHANT_JSON_KEY_PATH;
    }

    this.client = new ProductsServiceClient(options);
  }

  async insertProduct(productData) {
    const parent = `accounts/${this.merchantId}`;
    try {
      const [response] = await this.client.insertProduct({
        parent,
        product: productData,
        dataSource: `accounts/${this.merchantId}/dataSources/available` // default data source
      });
      console.warn("Product uploaded successfully:", response.name);
      return response;
    } catch (error) {
      console.warn("Error uploading product:", error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    const name = `accounts/${this.merchantId}/products/${productId}`;
    try {
      await this.client.deleteProduct({ name });
      console.warn("Product deleted successfully:", name);
      return true;
    } catch (error) {
      console.warn("Error deleting product:", error);
      throw error;
    }
  }
  async insertProducts(products) {
    const BATCH_SIZE = 1000;
    const batches = this._chunkArray(products, BATCH_SIZE);

    console.warn(`Starting sync for ${products.length} products in ${batches.length} batches...`);

    for (const batch of batches) {
      try {
        // Use parallel individual inserts for robustness
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
