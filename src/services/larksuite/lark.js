import * as lark from "@larksuiteoapi/node-sdk";
import { createFetchAdapter } from "@haverstack/axios-fetch-adapter";
const fetchAdapter = createFetchAdapter();

export default class LarksuiteService {
  static createClient(env) {
    const client = new lark.Client({
      appId: env.LARKSUITE_APP_ID,
      appSecret: env.LARKSUITE_APP_SECRET,
      domain: "https://open.larksuite.com"
    });
    client.httpInstance.defaults.adapter = fetchAdapter;
    return client;
  }

  static async getTenantAccessToken(env) {
    const larkClient = LarksuiteService.createClient(env);
    const res = await larkClient.auth.tenantAccessToken.internal({
      data: {
        app_id: env.LARKSUITE_APP_ID,
        app_secret: env.LARKSUITE_APP_SECRET
      }
    });
    return res.tenant_access_token;
  }
};
