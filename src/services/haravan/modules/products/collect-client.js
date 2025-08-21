import { BaseClient } from "services/haravan/base-client";

export class CollectClient extends BaseClient {
  constructor(env) {
    super(env);
  }

  async getListOfCollects() {
    const path = "/com/collects.json";
    return await this.makeGetRequest(path);
  }
}
