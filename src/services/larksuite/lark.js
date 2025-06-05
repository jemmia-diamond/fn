import * as lark from "@larksuiteoapi/node-sdk";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";

export default class LarksuiteService {
  static createClient(env) {
    const client = new lark.Client({
      appId: env.LARKSUITE_APP_ID,
      appSecret: env.LARKSUITE_APP_SECRET
    });
    client.httpInstance.defaults.adapter = fetchAdapter;
    return client;
  }
};
