import { createDirectus, staticToken, rest } from "@directus/sdk";

export default class DirectusClient {
  static async createClient(endpoint, token) {
    const client = createDirectus(endpoint).with(rest()).with(staticToken(token));
    return client;
  }
}
