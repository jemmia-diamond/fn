import * as Sentry from "@sentry/cloudflare";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class ProductVariantService {
  constructor(env) {
    this.env = env;
  }

  async clearIncomingStockTag(product) {
    const variants = product.variants || [];

    const nocodb = new NocoDBClient(this.env);
    const diamondTableId = NOCODB_TABLES.DIAMONDS;

    for (const variant of variants) {
      const qty = variant?.inventory_advance?.qty_available ?? 0;

      if (qty > 0) {
        const res = await nocodb.listRecords(diamondTableId, {
          where: `(product_id,eq,${product.id})~and(variant_id,eq,${variant.id})~and(is_incoming,is,true)`,
          limit: 1
        });
        const diamond = res.list?.[0] ?? null;

        if (diamond) {
          await nocodb.updateRecords(diamondTableId, {
            id: diamond.id,
            is_incoming: null
          });
        }
      }
    }
  }

  async updateStockTag(diamondId, hasStock) {
    const nocodb = new NocoDBClient(this.env);
    const diamondTableId = NOCODB_TABLES.DIAMONDS;

    await nocodb.updateRecords(diamondTableId, {
      Id: diamondId,
      is_incoming: hasStock ? null : true // Assuming hasStock means it's not incoming, and !hasStock means it is incoming
    });
  }

  async findVariantsByGiaReport(diamond) {
    const nocodb = new NocoDBClient(this.env);
    const variantTableId = NOCODB_TABLES.VARIANTS;
    const giaReportNo = diamond.report_no;
    return await nocodb.listRecords(variantTableId, {
      where: `(sku,like,%${giaReportNo}%)`
    });
  }

  async clearFinalDiscountValueIfOutOfStock(product) {
    const variants = product.variants || [];

    const nocodb = new NocoDBClient(this.env);
    const variantsTableId = NOCODB_TABLES.VARIANTS;

    for (const variant of variants) {
      const qty = variant?.inventory_advance?.qty_available ?? 0;

      if (qty === 0) {
        const records = await nocodb.listRecords(variantsTableId, {
          where: `(haravan_product_id,eq,${product.id})~and(haravan_variant_id,eq,${variant.id})~and(final_discount_price,gt,0)`
        });

        if (records?.list?.length > 0) {
          for (const record of records.list) {
            await nocodb.updateRecords(variantsTableId, {
              id: record.id,
              final_discount_price: 0
            });
          }
        }
      }
    }
  }

  static async dequeueProductQueue(batch, env) {
    const service = new ProductVariantService(env);
    for (const message of batch.messages) {
      try {
        const body = message.body;

        await service.clearIncomingStockTag(body);
        await service.clearFinalDiscountValueIfOutOfStock(body);
      }
      catch (error) {
        Sentry.captureException(error);
      }
    }
  }
}
