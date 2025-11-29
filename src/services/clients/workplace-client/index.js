import { Api } from "nocodb-sdk";
import HaravanCollectionClient from "services/clients/workplace-client/haravan-collection-client";
import DiamondClient from "services/clients/workplace-client/diamond-client";

export class WorkplaceClient {
  constructor(apiToken, baseId) {
    this.api = new Api({
      baseURL: "https://workplace.jemmia.vn/",
      headers: {
        "xc-token": apiToken
      }
    });
    this.haravanCollections = new HaravanCollectionClient(this.api, baseId);
    this.diamonds = new DiamondClient(this.api, baseId);
  }
}
