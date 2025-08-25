import { BaseClient } from "services/haravan/base-client";

export class ProductClient extends BaseClient {
  constructor(env) {
    super(env);
  }

  async getListOfProducts() {
    const path = "/com/products.json";
    return await this.makeGetRequest(path);
  }
}
