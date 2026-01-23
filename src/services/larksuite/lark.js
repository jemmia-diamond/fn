import * as lark from "@larksuiteoapi/node-sdk";
import { createFetchAdapter } from "@haverstack/axios-fetch-adapter";
import { createAxiosClient, DEFAULT_RETRY_CONFIG } from "services/utils/http-client";
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

  static async createClientV2(env) {
    const larkAppId = env.LARK_APP_ID;
    const larkAppSecretSecret = await env.LARK_APP_SECRET_SECRET.get();
    const larkApiEndpoint = env.LARK_API_ENDPOINT;
    const client = new lark.Client({
      appId: larkAppId,
      appSecret: larkAppSecretSecret,
      domain: larkApiEndpoint
    });
    client.httpInstance.defaults.adapter = fetchAdapter;
    return client;
  }

  static async createLarkAxiosClient(env) {
    const token = await this.getTenantAccessToken(env);
    const client = createAxiosClient({
      baseURL: env.LARK_API_ENDPOINT,
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }, { ...DEFAULT_RETRY_CONFIG, retries: 6 });
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

  static async getTenantAccessTokenFromClient({ larkClient, env }) {
    const res = await larkClient.auth.tenantAccessToken.internal({
      data: {
        app_id: env.LARK_APP_ID,
        app_secret: await env.LARK_APP_SECRET_SECRET.get()
      }
    });
    return res.tenant_access_token;
  }

  static async requestWithPagination(fn, payload, pageSize) {
    const _payload = payload;
    let pageToken = null;
    const responses = [];
    _payload.params = payload.params || {};
    _payload.params.page_size = pageSize;
    _payload.params.page_token = pageToken;
    try {
      do {
        const res = await fn(_payload);
        responses.push(res);
        pageToken = res?.data?.page_token || null;
        _payload.params.page_token = pageToken;
      } while (pageToken);
    } catch (err) {
      throw new Error(`Lark pagination request failed: ${err?.message || String(err)}`);
    }
    return responses;
  }

  static async getUserInfo(env, userId) {
    const client = this.createClient(env);
    const res = await client.contact.user.get({
      path: {
        user_id: userId
      },
      params: {
        user_id_type: "user_id"
      }
    });
    return res.data?.user;
  }
};
