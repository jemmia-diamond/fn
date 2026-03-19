import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class DiamondClient extends BaseWorkplaceClient {
  constructor(nocodbClient, baseId, tableId) {
    super(nocodbClient, baseId, tableId);
  }

  async get(id) {
    return await this.getById(id);
  }
}
