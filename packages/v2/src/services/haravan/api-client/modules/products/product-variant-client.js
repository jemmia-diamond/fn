import BaseClient from "services/haravan/api-client/base-client";

export default class ProductVariantClient extends BaseClient {
  constructor(env) {
    super(env);
  }

  async getListOfVariants(productId) {
    const path = `/com/products/${productId}/variants.json`;
    return await this.makeGetRequest(path);
  }
}
