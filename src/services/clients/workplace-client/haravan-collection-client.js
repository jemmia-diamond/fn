import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class HaravanCollectionClient extends BaseWorkplaceClient {
  constructor(api, baseId) {
    super(api, baseId, "haravan_collections");
  }

  async get(id) {
    return await this.getById(id);
  }
}
