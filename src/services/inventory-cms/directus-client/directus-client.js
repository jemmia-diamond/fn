import { createDirectus, staticToken, rest } from "@directus/sdk";

export default class DirectusClient {
  static async createClient(env) {
    const enpoint = env.INVENTORY_CMS_ENPOINT;
    const token = await env.INVENTORY_CMS_STATIC_TOKEN_SECRET.get();
    const client = createDirectus(enpoint).with(rest()).with(staticToken(token));
    return client;
  }
}
