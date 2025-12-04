import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class JewelryClient extends BaseWorkplaceClient {
  constructor(api, baseId) {
    super(api, baseId, "products");
  }

  async get(id) {
    return await this.getById(id);
  }
}
