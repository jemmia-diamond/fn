import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";
import * as Sentry from "@hono/sentry";

dayjs.extend(utc);

export default class DiamondSyncService {
  constructor(env) {
    this.env = env;
    const hrvAccessToken = env.HARAVAN_NOCODB_TOKEN || env.HARAVAN_TOKEN;
    this.client = new HaravanAPI(hrvAccessToken);
    this.nocoClient = new NocoDBClient(env);
  }

  static async cronSync(env, controller) {
    const service = new DiamondSyncService(env);
    const scheduledTime = controller?.scheduledTime
      ? dayjs(controller.scheduledTime).utc().format("YYYY-MM-DDTHH:mm:ss[Z]")
      : dayjs().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    return await service.sync({ time: scheduledTime });
  }

  async sync(event = {}) {
    const timeBefore1Hours = dayjs(event?.time).isValid()
      ? dayjs.utc(event.time).add(6, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]")
      : null;

    const variantList = await this.getVariantIds(timeBefore1Hours);
    if (!Array.isArray(variantList)) return variantList;

    const processedData = [];
    for (const variant of variantList) {
      const processedVariant = {
        variant_id: variant.id,
        product_id: variant.product_id,
        barcode: variant?.barcode,
        vendor: variant?.vender_product,
        promotions: this.getProductInfo(variant?.tags_product),
        published_scope: variant?.published_scope,
        price: Number(variant?.price) || null,
        qty_onhand: variant?.qty_onhand,
        qty_available: variant?.qty_available,
        qty_commited: variant?.qty_commited,
        qty_incoming: variant?.qty_incoming,
        link_haravan: `https://jemmiavn.myharavan.com/admin/products/${variant.product_id}`
      };
      processedData.push(processedVariant);
    }
    try {
      await this.updateData(processedData);
      return true;
    } catch (error) {
      Sentry.captureException(error);
      return {
        status: "error",
        message: `Error syncing diamond data: ${error.message || error}`
      };
    }
  }

  async updateData(dataList) {
    const variantIds = dataList.map((r) => r.variant_id).filter(Boolean);
    if (!variantIds?.length) return;

    const existingMap = new Map();
    const searchData = await this.nocoClient.listRecords(
      NOCODB_TABLES.SUPPLY.DIAMONDS,
      {
        where: `(variant_id,in,${variantIds.join(",")})`,
        limit: 1000,
        fields: ["id", "variant_id"]
      }
    );

    for (const rec of searchData?.list) {
      existingMap.set(String(rec.variant_id), rec.id);
    }

    for (let idx = 0; idx < dataList.length; idx++) {
      const row = dataList[idx];
      if (!row.variant_id) continue;

      const nocoId = existingMap.get(String(row.variant_id));
      if (!nocoId) continue;

      await this.nocoClient.updateRecords(NOCODB_TABLES.SUPPLY.DIAMONDS, {
        id: nocoId,
        ...row
      });
    }
  }

  getProductInfo(tags) {
    if (tags) {
      const splitTags = tags.split(",");
      const promotions = splitTags.filter((tag) => tag.includes("CT nền giảm"));
      return promotions.join(",") || null;
    }
    return null;
  }

  async getVariantIds(updatedAtMin = null) {
    let page = 1;
    let pageResultNum = -1;
    const limit = 50;
    const variantList = [];

    while (pageResultNum !== 0) {
      const params = { page, limit };
      if (updatedAtMin) {
        params.updated_at_min = updatedAtMin;
      }

      const productResponse = await this.client.product.getProducts(params);
      const productList = productResponse?.products || [];

      for (const i of productList) {
        for (const y of i?.variants) {
          y.published_scope = i?.published_scope;
          y.tags_product = i?.tags;
          y.vender_product = i?.vendor;

          const inv = y?.inventory_advance;
          if (inv) {
            y.qty_onhand = Number(inv?.qty_onhand || 0);
            y.qty_available = Number(inv?.qty_available || 0);
            y.qty_commited = Number(inv?.qty_commited || 0);
            y.qty_incoming = Number(inv?.qty_incoming || 0);
          }
          variantList.push(y);
        }
      }
      page = page + 1;
      pageResultNum = productList.length;
    }
    return variantList;
  }
}
