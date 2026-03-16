import { BadRequestException } from "src/exception/exceptions";
import HaravanCollectionClient from "services/clients/workplace-client/haravan-collection-client";
import DiamondClient from "services/clients/workplace-client/diamond-client";
import JewelryClient from "services/clients/workplace-client/jewelry-client";
import DesignImageClient from "services/clients/workplace-client/design-image-client";
import DesignsClient from "services/clients/workplace-client/design-client";
import BaseWorkplaceClient from "services/clients/workplace-client/base-client";
import NocoDBClient from "services/clients/nocodb-client";

export class WorkplaceClient {
  constructor(nocodbClient, baseId, tableMap = {}) {
    this.nocodbClient = nocodbClient;
    this.baseId = baseId;
    this.tableMap = tableMap;

    this.haravanCollections = new HaravanCollectionClient(this.nocodbClient, baseId, tableMap["haravan_collections"]);
    this.diamonds = new DiamondClient(this.nocodbClient, baseId, tableMap["diamonds"]);
    this.jewelries = new JewelryClient(this.nocodbClient, baseId, tableMap["products"]);
    this.designImages = new DesignImageClient(this.nocodbClient, baseId, tableMap["design_images"]);
    this.designs = new DesignsClient(this.nocodbClient, baseId, tableMap["designs"]);
    this.variants = new BaseWorkplaceClient(this.nocodbClient, baseId, tableMap["variants"]);
    this.diamondHaravanCollections = new BaseWorkplaceClient(this.nocodbClient, baseId, tableMap["diamonds_haravan_collection"]);
    this.jewelryHaravanCollections = new BaseWorkplaceClient(this.nocodbClient, baseId, tableMap["products_haravan_collection"]);
    this.collections = new BaseWorkplaceClient(this.nocodbClient, baseId, tableMap["collections"]);
  }

  static async initialize(env, baseId) {
    const token = await env.NOCODB_API_TOKEN_SECRET.get();
    const baseUrl = env.NOCODB_WORKPLACE_BASE_URL;
    if (!token || !baseId || !baseUrl) {
      throw new BadRequestException("NocoDB credentials are not configured.");
    }

    const nocodbClient = new NocoDBClient(env);
    const tables = await nocodbClient.getTables(baseId);
    const tableMap = {};

    if (tables && tables.list) {
      for (const table of tables.list) {
        tableMap[table.title] = table.id;
      }
    }

    return new WorkplaceClient(nocodbClient, baseId, tableMap);
  }
}
