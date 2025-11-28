
import { Api } from "nocodb-sdk";

export class WorkplaceClient {
  constructor(apiToken, baseId) {
    this.api = new Api({
      baseURL: "https://workplace.jemmia.vn/",
      headers: {
        "xc-token": apiToken
      }
    });
    this.baseId = baseId;
  }

  async getHaravanCollection(id) {
    const res = await this.api.dbTableRow.list(
      "noco",
      this.baseId,
      "haravan_collections",
      {
        where: `(id,eq,${id})`,
        limit: 1
      }
    );
    return res.list[0];
  }

  async getDiamond(id) {
    const res = await this.api.dbTableRow.list(
      "noco",
      this.baseId,
      "diamonds",
      {
        where: `(id,eq,${id})`,
        limit: 1
      }
    );
    return res.list[0];
  }
}
