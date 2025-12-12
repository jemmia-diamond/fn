import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class DiamondHaravanCollectionClient extends BaseWorkplaceClient {
  constructor(api, baseId) {
    super(api, baseId, "diamonds_haravan_collection");
  }
}
