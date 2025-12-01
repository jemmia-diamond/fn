import * as Sentry from "@sentry/cloudflare";
import HaravanAPI from "services/clients/haravan-client";
import { WorkplaceClient } from "services/clients/workplace-client";
import { BadRequestException } from "src/exception/exceptions";

export default class CollectService {
  constructor(env) {
    this.env = env;
  }

  async createCollect(body) {
    const { haravan_collection_id, diamond_id, product_id } = body.data.rows[0];

    const targetId = diamond_id || product_id;

    if (!haravan_collection_id || !targetId) {
      return;
    }

    const NOCO_TOKEN = await this.env.NOCODB_API_TOKEN.get();
    const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
    const WORKPLACE_BASE_URL = this.env.NOCODB_WORKPLACE_BASE_URL;

    if (!NOCO_TOKEN || !WORKPLACE_BASE_ID || !WORKPLACE_BASE_URL) {
      throw new BadRequestException("NocoDB credentials are not configured.");
    }

    const workplaceClient = new WorkplaceClient(NOCO_TOKEN, WORKPLACE_BASE_ID, WORKPLACE_BASE_URL);

    // Get Haravan Collection ID from ID
    const collection = await workplaceClient.haravanCollections.get(haravan_collection_id);

    if (!collection) {
      return;
    }
    const realCollectionId = collection.haravan_id;

    // Get Haravan Product ID from ID
    let realProductId;
    if (targetId) {
      // TODO: Apply for jewelry
      const diamond = await workplaceClient.diamonds.get(targetId);
      if (diamond) {
        realProductId = diamond.product_id;
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

    const NOCO_TOKEN = await this.env.NOCODB_API_TOKEN.get();
    const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
    const WORKPLACE_BASE_URL = this.env.NOCODB_WORKPLACE_BASE_URL;

    if (!NOCO_TOKEN || !WORKPLACE_BASE_ID || !WORKPLACE_BASE_URL) {
      throw new BadRequestException("NocoDB credentials are not configured.");
    }

    const workplaceClient = new WorkplaceClient(NOCO_TOKEN, WORKPLACE_BASE_ID, WORKPLACE_BASE_URL);

    // Get Haravan Collection ID
    const collection = await workplaceClient.haravanCollections.get(haravan_collection_id);

    if (!collection) {
      return;
    }
    const realCollectionId = collection.haravan_id;

    // Get Haravan Product ID
    let realProductId;
    if (targetId) {
      // TODO: Apply for jewelry
      const diamond = await workplaceClient.diamonds.get(targetId);
      if (diamond) {
        realProductId = diamond.product_id;
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
