import * as Sentry from "@sentry/cloudflare";
import Database from "services/database";
import HaravanAPI from "services/clients/haravan-client";
import { BadRequestException } from "src/exception/exceptions";

export default class CollectService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
  }

  async createCollect(body) {
    const { haravan_collection_id, diamond_id, product_id } = body.data.rows[0];

    const targetId = diamond_id || product_id;

    if (!haravan_collection_id || !targetId) {
      return;
    }

    // Get Haravan Collection ID from ID
    const collection = await this.db.$queryRaw`
      SELECT haravan_id FROM workplace.haravan_collections WHERE id = ${haravan_collection_id} LIMIT 1
    `;

    if (!collection || collection.length === 0) {
      return;
    }
    const realCollectionId = collection[0].haravan_id;

    // Get Haravan Product ID from ID
    let realProductId;
    if (targetId) {
      // TODO: Apply for jewelry
      const diamond = await this.db.$queryRaw`
        SELECT product_id FROM workplace.diamonds WHERE id = ${targetId} LIMIT 1
      `;
      if (diamond && diamond.length > 0) {
        realProductId = diamond[0].product_id;
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
    const { haravan_collection_id, diamond_id, product_id } = body.data.rows[0];

    const targetId = diamond_id || product_id;

    if (!haravan_collection_id || !targetId) {
      return;
    }

    // Get Haravan Collection ID
    const collection = await this.db.$queryRaw`
      SELECT haravan_id FROM workplace.haravan_collections WHERE id = ${haravan_collection_id} LIMIT 1
    `;

    if (!collection || collection.length === 0) {
      return;
    }
    const realCollectionId = collection[0].haravan_id;

    // Get Haravan Product ID
    let realProductId;
    if (targetId) {
      // TODO: Apply for jewelry
      const diamond = await this.db.$queryRaw`
        SELECT product_id FROM workplace.diamonds WHERE id = ${targetId} LIMIT 1
      `;
      if (diamond && diamond.length > 0) {
        realProductId = diamond[0].product_id;
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
