import BaseWorkplaceClient from "services/clients/workplace-client/base-client";

export default class JewelryHaravanCollectionClient extends BaseWorkplaceClient {
  constructor(api, baseId) {
    super(api, baseId, "products_haravan_collection");
  }
}
