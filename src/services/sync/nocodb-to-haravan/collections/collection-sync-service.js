import HaravanAPI from "services/clients/haravan-client";
import NocoDBClient from "services/clients/nocodb-client";
import { NOCODB_TABLES } from "src/constants/nocodb-tables";

export default class CollectionSyncService {
  constructor(env) {
    this.env = env;
  }

  async handle(payload) {
    const data = payload?.data?.rows?.[0];
    const tableId = payload?.data?.table_id;

    if (tableId !== NOCODB_TABLES.MARKETING.HARAVAN_COLLECTIONS) {
      throw new Error(`Ignored table ID: ${tableId}`);
    }

    if (!data) {
      throw new Error("No data found in payload");
    }

    const { id, title, haravan_id: haravanId, auto_create: autoCreate } = data;

    const nocoClient = new NocoDBClient(this.env);
    const haravanApi = new HaravanAPI(this.env.HARAVAN_TOKEN);

    if (haravanId) {
      await haravanApi.collectCustom.updateCustomCollect(haravanId, {
        id: Number(haravanId),
        title
      });
      return { updated: true, haravanId };
    }

    if (!autoCreate) {
      return { skipped: true };
    }

    const created = await haravanApi.collectCustom.createCustomCollect({
      title,
      published_scope: "pos",
      published: false
    });

    const createdId = created?.custom_collection?.id;
    if (!createdId) {
      throw new Error("Failed to create custom collection on Haravan");
    }

    await nocoClient.updateRecords(tableId, {
      id,
      haravan_id: Number(createdId)
    });

    return { created: true, haravanId: createdId };
  }
}
