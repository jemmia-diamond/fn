import * as Sentry from "@sentry/cloudflare";
import HaravanAPI from "services/clients/haravan-client";
import { BadRequestException } from "src/exception/exceptions";

export default class CollectService {
  constructor(env) {
    this.env = env;
  }

  async createCollect(body) {
    const { haravan_collections_id, diamonds_id } = body.data.rows[0];
    if (!haravan_collections_id || !diamonds_id) {
      return;
    }

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();

    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }

    const hrvClient = new HaravanAPI(HRV_API_KEY);

    const newCollect = await hrvClient.collect.createCollect({
      "product_id": diamonds_id,
      "collection_id": haravan_collections_id
    });

    return newCollect;
  }

  async removeCollect(body) {
    const { haravan_collections_id, diamonds_id } = body.data.rows[0];

    if (!haravan_collections_id || !diamonds_id) {
      return;
    }

    const HRV_API_KEY = await this.env.HARAVAN_TOKEN_SECRET.get();

    if (!HRV_API_KEY) {
      throw new BadRequestException("Haravan API credentials or base URL are not configured in the environment.");
    }
    const hrvClient = new HaravanAPI(HRV_API_KEY);
    const collects = await hrvClient.collect.getCollects({
      "collection_id": haravan_collections_id,
      "product_id": diamonds_id
    });

    if (collects && collects.length > 0) {
      const collectId = collects[0].id;
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
