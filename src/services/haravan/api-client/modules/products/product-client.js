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

  async getListOfProductBaseOnUpdatedTime(updated_at_min) {
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
      const path = "/com/products.json";
      const data = await this.makeGetRequest(path, { updated_at_min, page, limit });
      const products = data?.data?.products || [];

      if (products.length > 0) {
        allProducts = allProducts.concat(products);
        page++;
      } else {
        hasMore = false;
      }
    }
    return allProducts;
  }
}
