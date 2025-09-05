import BaseClient from "services/haravan/api-client/base-client";

export default class ProductClient extends BaseClient {
  constructor(env) {
    super(env);
  }

  async getListOfProducts() {
    const path = "/com/products.json";
    return await this.makeGetRequest(path);
  }

  async getProduct(productId) {
    const path = `/com/products/${productId}.json`;
    return await this.makeGetRequest(path);
  }
}
