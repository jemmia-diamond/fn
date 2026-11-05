import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { BadRequestException } from "src/exception/exceptions";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class CollectService {
  constructor(env) {
    this.env = env;
    this.nocodb = new NocoDBClient(env);
  }

  async createCollect(row) {
    const target = await this._resolveTarget(row);
    if (!target?.productId || !target?.collectionId) {
      return;
    }

    try {
      return await this._haravanClient().collect.createCollect({
        product_id: target.productId,
        collection_id: target.collectionId
      });
    } catch (error) {
      if (error.response?.status === 422) {
        return;
      }
      throw error;
    }
  }

  async removeCollect(row) {
    const target = await this._resolveTarget(row);
    if (!target?.productId || !target?.collectionId) {
      return;
    }

    const hrvClient = this._haravanClient();
    const collectsData = await hrvClient.collect.getCollects({
      collection_id: target.collectionId,
      product_id: target.productId
    });
    const collects = (collectsData?.collects || []).filter(
      (collect) => String(collect.collection_id) === String(target.collectionId)
    );

    for (const collect of collects) {
      await hrvClient.collect.deleteCollect(collect.id);
    }

    return collects.length;
  }

  async _resolveTarget(row) {
    const collectionId =
      row?.haravan_collection_id ?? row?.haravan_collections_id;
    const diamondId = row?.diamond_id;
    const productId = row?.product_id ?? row?.products_id;

    if (!collectionId || (!diamondId && !productId)) {
      return null;
    }

    const collectionRes = await this.nocodb.listRecords(
      NOCODB_TABLES.MARKETING.HARAVAN_COLLECTIONS,
      {
        where: `(id,eq,${collectionId})`,
        limit: 1,
        fields: "id,haravan_id"
      }
    );
    const collection = collectionRes.list?.[0];
    if (!collection) {
      return null;
    }

    if (diamondId) {
      const diamondRes = await this.nocodb.listRecords(
        NOCODB_TABLES.MARKETING.DIAMONDS,
        { where: `(id,eq,${diamondId})`, limit: 1, fields: "id,product_id" }
      );
      return {
        collectionId: collection.haravan_id,
        productId: diamondRes.list?.[0]?.product_id
      };
    }

    const jewelryRes = await this.nocodb.listRecords(
      NOCODB_TABLES.MARKETING.JEWELRIES,
      {
        where: `(id,eq,${productId})`,
        limit: 1,
        fields: "id,haravan_product_id"
      }
    );
    return {
      collectionId: collection.haravan_id,
      productId: jewelryRes.list?.[0]?.haravan_product_id
    };
  }

  _haravanClient() {
    const HRV_API_KEY = this.env.HARAVAN_NOCODB_TOKEN;

    if (!HRV_API_KEY) {
      throw new BadRequestException(
        "Haravan API credentials or base URL are not configured in the environment."
      );
    }

    return new HaravanAPI(HRV_API_KEY);
  }

  static async dequeueCollectQueue(batch, env) {
    const service = new CollectService(env);
    for (const message of batch.messages) {
      const { type, data } = message.body;
      for (const row of data?.rows || []) {
        if (type === "records.after.insert") {
          await service.createCollect(row);
        } else if (type === "records.after.delete") {
          await service.removeCollect(row);
        }
      }
    }
  }
}
