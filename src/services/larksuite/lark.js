import * as lark from "@larksuiteoapi/node-sdk";
import { createFetchAdapter } from "@haverstack/axios-fetch-adapter";
import { createAxiosClient, DEFAULT_RETRY_CONFIG } from "services/utils/http-client";
const fetchAdapter = createFetchAdapter();
let clientV2Instance = null;

export default class LarksuiteService {

  static async _getCredentials(env) {
    const appId = env.LARK_APP_ID || env.LARKSUITE_APP_ID;
    let appSecret;

    try {
      appSecret = await env.LARK_APP_SECRET_SECRET?.get();
    } catch {
      appSecret = env.LARKSUITE_APP_SECRET;
    }
    appSecret = appSecret || env.LARKSUITE_APP_SECRET;

    return { appId, appSecret };
  }

  static async createClientV2(env) {
    if (clientV2Instance) {
      return clientV2Instance;
    }

    const { appId, appSecret } = await this._getCredentials(env);
    const larkApiEndpoint = env.LARK_API_ENDPOINT || "https://open.larksuite.com";

    clientV2Instance = new lark.Client({
      appId: appId,
      appSecret: appSecret,
      domain: larkApiEndpoint
    });
    clientV2Instance.httpInstance.defaults.adapter = fetchAdapter;
    return clientV2Instance;
  }

  static async createLarkAxiosClient(env, token) {
    const client = createAxiosClient({
      baseURL: env.LARK_API_ENDPOINT,
      timeout: 15000,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }, { ...DEFAULT_RETRY_CONFIG, retries: 6 });
    client.defaults.adapter = fetchAdapter;
    return client;
  }

  static async getTenantAccessToken(env) {
    const larkClient = await LarksuiteService.createClientV2(env);
    const { appId, appSecret } = await this._getCredentials(env);

    const res = await larkClient.auth.tenantAccessToken.internal({
      data: {
        app_id: appId,
        app_secret: appSecret
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
    const client = await this.createClientV2(env);
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
