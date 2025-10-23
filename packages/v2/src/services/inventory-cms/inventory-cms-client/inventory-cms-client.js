import DirectusClient from "services/inventory-cms/directus-client/directus-client";

export default class InventoryCMSClient {
  static async createClient(env) {
    const endpoint = env.INVENTORY_CMS_ENDPOINT;
    const token = await env.INVENTORY_CMS_STATIC_TOKEN_SECRET.get();
    return DirectusClient.createClient(endpoint, token);
  }
}
