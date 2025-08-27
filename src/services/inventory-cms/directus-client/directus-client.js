import { createDirectus, staticToken, rest } from "@directus/sdk";

export default class DirectusClient {
  static async createClient(env) {
    const endpoint = env.INVENTORY_CMS_ENDPOINT;
    const token = await env.INVENTORY_CMS_STATIC_TOKEN_SECRET.get();
    const client = createDirectus(endpoint).with(rest()).with(staticToken(token));
    return client;
  }
}
