import BaseClient from "services/haravan/api-client/base-client";

export default class CollectClient extends BaseClient {
  constructor(env) {
    super(env);
  }

  async getListOfCollects() {
    const path = "/com/collects.json";
    return await this.makeGetRequest(path);
  }
}
