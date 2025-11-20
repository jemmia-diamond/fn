import * as Sentry from "@sentry/cloudflare";
import dayjs from "dayjs";
import Database from "services/database";
import MisaClient from "services/clients/misa-client";
import HaravanAPIClient from "services/haravan/api-client/api-client";
import ProductToMisaMapper from "services/haravan/dtos/product-to-misa";
import InventoryItemMappingService from "services/misa/mapping/inventory-item-mapping-service";

export default class MisaInventoryItemSyncService {
  constructor(env) {
    this.env = env;
    this.db = Database.instance(env);
    this.haravanClient = new HaravanAPIClient(env);
  }

  async syncInventoryItems() {
    const now = dayjs().utc();
    const updatedAtMin = now.subtract(1, "hour").format("YYYY-MM-DDTHH:mm:ss[Z]");

    const misaClient = new MisaClient(this.env);
    await misaClient.getAccessToken();

    await this.haravanClient.products.product.getListOfProductBaseOnUpdatedTime(
      updatedAtMin,
      async (products) => await this._processProductBatch(products, misaClient)
    );

    return;
  }

  async _processProductBatch(products, misaClient) {
    if (!products || products.length === 0) {
      return;
    }

    const variants = ProductToMisaMapper.transform(products);
    if (variants.length === 0) {
      return;
    }

    const variantsWithSku = variants.filter(v => v.sku);
    if (variantsWithSku.length === 0) {
      return;
    }

    const skus = variantsWithSku.map(v => v.sku);
    const existingSKUs = await this._checkExistingSKUs(skus);
    const existingSKUSet = new Set(existingSKUs);
    const newVariants = variantsWithSku.filter(v => !existingSKUSet.has(v.sku));

    if (newVariants.length === 0) {
      return;
    }

    const currentTime = String(Date.now());
    const inventoryItems = newVariants.map(variant =>
      InventoryItemMappingService.transformHaravanItemToMisa(variant, currentTime)
    );

    const misaResponse = await this._saveDictionaryToMisa(misaClient, inventoryItems);

    if (misaResponse.Success === true) {
      await this._trackSyncedItems(newVariants);

    } else {
      const errorMsg = {
        skus: newVariants.map(v => v.sku),
        count: newVariants.length,
        misa_response: misaResponse?.ErrorMessage
      };
      Sentry.captureMessage(`MISA Inventory Sync failed at ${currentTime}`, {
        level: "error",
        extra: errorMsg
      });
    }
  }

  async _checkExistingSKUs(skus) {
    const existingItems = await this.db.misaInventoryItem.findMany({
      where: { sku: { in: skus } },
      select: { sku: true }
    });
    return existingItems.map(item => item.sku);
  }

  async _saveDictionaryToMisa(misaClient, inventoryItems) {
    const payload = {
      app_id: this.env.MISA_APP_ID,
      org_company_code: this.env.MISA_ORG_CODE,
      dictionary: inventoryItems
    };

    return await misaClient.saveDictionary(payload);
  }

  async _trackSyncedItems(variants) {
    const upsertOperations = variants.map(variant =>
      this.db.misaInventoryItem.upsert({
        where: { sku: variant.sku },
        create: {
          uuid: crypto.randomUUID(),
          sku: variant.sku
        },
        update: {
          database_updated_at: new Date()
        }
      })
    );
    await this.db.$transaction(upsertOperations);
  }
}
