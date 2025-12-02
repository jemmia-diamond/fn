import { Api } from "nocodb-sdk";
import { BadRequestException } from "src/exception/exceptions";
import HaravanCollectionClient from "services/clients/workplace-client/haravan-collection-client";
import DiamondClient from "services/clients/workplace-client/diamond-client";
import DesignImageClient from "services/clients/workplace-client/design-image-client";
import DesignsClient from "services/clients/workplace-client/design-client";

export class WorkplaceClient {
  constructor(apiToken, baseId, baseUrl) {
    this.api = new Api({
      baseURL: baseUrl,
      headers: {
        "xc-token": apiToken
      }
    });
    this.haravanCollections = new HaravanCollectionClient(this.api, baseId);
    this.diamonds = new DiamondClient(this.api, baseId);
    this.designImages = new DesignImageClient(this.api, baseId);
    this.designs = new DesignsClient(this.api, baseId);
  }

  static async create(env, baseId) {
    const token = await env.NOCODB_API_TOKEN_SECRET.get();
    const baseUrl = env.NOCODB_WORKPLACE_BASE_URL;
    if (!token || !baseId || !baseUrl) {
      throw new BadRequestException("NocoDB credentials are not configured.");
    }
    return new WorkplaceClient(token, baseId, baseUrl);
  }
}
