import * as Sentry from "@sentry/cloudflare";
import { WorkplaceClient } from "services/clients/workplace-client";
import DiamondDiscountService from "services/ecommerce/diamond/diamond-discount-service";

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
        const diamonds = await workplaceClient.diamonds.list({
          where: "(auto_create_haravan_product,is,true)~and(product_id,gt,0)~and(variant_id,gt,0)",
          limit: limit,
          offset: offset
        });

        if (!diamonds.list || diamonds.list.length === 0) {
          break;
        }

        for (const diamond of diamonds.list) {
          try {
            const discountPercent = DiamondDiscountService.calculateDiscountPercent({
              diamondSize: parseFloat(diamond.edge_size_2 || 0),
              productType: "KCV"
            });

            let haravanCollectionId = null;
            if (discountPercent === 8) haravanCollectionId = 32;
            else if (discountPercent === 10) haravanCollectionId = 34;
            else if (discountPercent === 12) haravanCollectionId = 33;

            if (haravanCollectionId) {
              await workplaceClient.diamondHaravanCollections.create({
                diamond_id: diamond.id,
                haravan_collection_id: haravanCollectionId
              });
            }
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
