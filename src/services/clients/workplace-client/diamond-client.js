import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class DiamondClient extends BaseWorkplaceClient {
  constructor(api, baseId) {
    super(api, baseId, "diamonds");
  }

  async get(id) {
    return await this.getById(id);
  }

  async list(params) {
    return await super.list(params);
  }
}
