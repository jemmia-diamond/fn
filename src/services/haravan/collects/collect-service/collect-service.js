import * as Sentry from "@sentry/cloudflare";
import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { BadRequestException } from "src/exception/exceptions";

export default class CollectService {
  static DIAMONDS_TABLE = "m4qggn3vyz5qyqi";
  static PRODUCTS_TABLE = "mhx7y71vqz64ydn";
  static HARAVAN_COLLECTIONS_TABLE = "mpgeruya41k3zcg";

  constructor(env) {
    this.env = env;
  }

  async createCollect(body) {
    let { haravan_collection_id, diamond_id, product_id, products_id, haravan_collections_id } = body.data.rows[0];

    if (!haravan_collection_id && haravan_collections_id) {
      haravan_collection_id = haravan_collections_id;
    }

    if (!product_id && products_id) {
      product_id = products_id;
    }

    if (!haravan_collection_id || (!diamond_id && !product_id)) {
      return;
    }

    const nocodb = new NocoDBClient(this.env);

    // Get Haravan Collection ID from ID
    const collectionRes = await nocodb.listRecords(CollectService.HARAVAN_COLLECTIONS_TABLE, { where: `(Id,eq,${haravan_collection_id})`, limit: 1 });
    const collection = collectionRes.list?.[0] ?? null;

    if (!collection) {
      return;
    }
    const realCollectionId = collection.haravan_id;

    // Get Haravan Product ID from ID
    let realProductId;
    if (diamond_id) {
      const diamondRes = await nocodb.listRecords(CollectService.DIAMONDS_TABLE, { where: `(Id,eq,${diamond_id})`, limit: 1 });
      const diamond = diamondRes.list?.[0] ?? null;
      if (diamond) {
        realProductId = diamond.product_id;
      }
    } else if (product_id) {
      const jewelryRes = await nocodb.listRecords(CollectService.PRODUCTS_TABLE, { where: `(Id,eq,${product_id})`, limit: 1 });
      const jewelry = jewelryRes.list?.[0] ?? null;
      if (jewelry) {
        realProductId = jewelry.haravan_product_id;
      }
    }

    if (!realProductId || !realCollectionId) {
      return;
    }

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();

    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    const hrvClient = new HaravanAPI(HRV_API_KEY);

    const newCollect = await hrvClient.collect.createCollect({
      "product_id": realProductId,
      "collection_id": realCollectionId
    });

    return newCollect;
  }

  async removeCollect(body) {
    let { haravan_collection_id, diamond_id, product_id, products_id, haravan_collections_id } = body.data.rows[0];

    if (!haravan_collection_id && haravan_collections_id) {
      haravan_collection_id = haravan_collections_id;
    }

    if (!product_id && products_id) {
      product_id = products_id;
    }

    if (!haravan_collection_id || (!diamond_id && !product_id)) {
      return;
    }

    const nocodb = new NocoDBClient(this.env);

    // Get Haravan Collection ID
    const collectionRes2 = await nocodb.listRecords(CollectService.HARAVAN_COLLECTIONS_TABLE, { where: `(Id,eq,${haravan_collection_id})`, limit: 1 });
    const collection = collectionRes2.list?.[0] ?? null;

    if (!collection) {
      return;
    }
    const realCollectionId = collection.haravan_id;

    // Get Haravan Product ID
    let realProductId;
    if (diamond_id) {
      const diamondRes2 = await nocodb.listRecords(CollectService.DIAMONDS_TABLE, { where: `(Id,eq,${diamond_id})`, limit: 1 });
      const diamond = diamondRes2.list?.[0] ?? null;
      if (diamond) {
        realProductId = diamond.product_id;
      }
    } else if (product_id) {
      const jewelryRes2 = await nocodb.listRecords(CollectService.PRODUCTS_TABLE, { where: `(Id,eq,${product_id})`, limit: 1 });
      const jewelry = jewelryRes2.list?.[0] ?? null;
      if (jewelry) {
        realProductId = jewelry.haravan_product_id;
      }
    }

    if (!realProductId) {
      return;
    }

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();

    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }
    const hrvClient = new HaravanAPI(HRV_API_KEY);
    const collectsData = await hrvClient.collect.getCollects({
      "collection_id": realCollectionId,
      "product_id": realProductId
    });

    if (collectsData && collectsData.collects && collectsData.collects.length > 0) {
      const collectId = collectsData.collects[0].id;
      const deletedCollect = await hrvClient.collect.deleteCollect(collectId);
      return deletedCollect;
    }

    return null;
  }

  static async dequeueCollectQueue(batch, env) {
    const service = new CollectService(env);
    for (const message of batch.messages) {
      try {
        const body = message.body;
        if (body.type === "records.after.insert") {
          await service.createCollect(body);
        } else if (body.type === "records.after.delete") {
          await service.removeCollect(body);
        }
      }
      catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
