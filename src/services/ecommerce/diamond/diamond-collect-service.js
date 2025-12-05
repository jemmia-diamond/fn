import * as Sentry from "@sentry/cloudflare";
import { WorkplaceClient } from "services/clients/workplace-client";

export default class DiamondCollectService {
  constructor(env) {
    this.env = env;
  }

  async syncDiamondsToCollects() {
    try {
      const WORKPLACE_BASE_ID = this.env.NOCODB_SUPPLY_BASE_ID;
      const workplaceClient = await WorkplaceClient.initialize(this.env, WORKPLACE_BASE_ID);

      let offset = 0;
      const limit = 200;

      while (true) {
        // Query diamonds with criteria
        const diamonds = await workplaceClient.diamonds.list({
          where: "(auto_create_haravan_product,is,true)~and(product_id,gt,0)~and(variant_id,gt,0)",
          limit: limit,
          offset: offset
        });

        if (!diamonds.list || diamonds.list.length === 0) {
          break;
        }

        const HARAVAN_COLLECTION_ID = 32;

        for (const diamond of diamonds.list) {
          try {
            await workplaceClient.diamondHaravanCollections.create({
              diamond_id: diamond.id,
              haravan_collection_id: HARAVAN_COLLECTION_ID
            });
          } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.code === "23505" || errorData?.message === "This record already exists.") {
              continue;
            }
            Sentry.captureException(error);
          }
        }

        offset += limit;
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
