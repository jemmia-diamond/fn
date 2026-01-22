import { createAxiosClient, DEFAULT_RETRY_CONFIG } from "services/utils/http-client";

export default class MisaClient {
  static RETRIEVABLE_LIMIT = 1000;
  static KV_TOKEN_KEY = "misa:access_token";
  static TOKEN_TTL_HOURS = 11;

  constructor(env) {
    this.env = env;
    this.baseUrl = "https://actapp.misa.vn";
    this.accessToken = null;
    this.timeout = 15000;
    this.client = null;
  }

  _initClient() {
    this.client = createAxiosClient({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: this._getAuthHeaders()
    }, { ...DEFAULT_RETRY_CONFIG, retries: 6 });
  }

  /**
   * Get access token from MISA API, this function should be called before any other function
   * @returns String access token (save to instance variable)
   */
  async getAccessToken() {
    const kv = this.env.FN_KV;
    const cachedToken = await kv.get(MisaClient.KV_TOKEN_KEY);

    if (cachedToken) {
      this.accessToken = cachedToken;
      this._initClient();
      return this.accessToken;
    }

    const tokenClient = createAxiosClient({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: { "Content-Type": "application/json" }
    }, { ...DEFAULT_RETRY_CONFIG, retries: 6 });
    const payload = {
      app_id: this.env.MISA_APP_ID,
      access_code: this.env.MISA_ACCESS_CODE,
      org_company_code: this.env.MISA_ORG_CODE
    };

    const response = await tokenClient.post("/api/oauth/actopen/connect", payload);
    this.accessToken = JSON.parse(response.data.Data).access_token;

    const ttlSeconds = MisaClient.TOKEN_TTL_HOURS * 60 * 60;
    await kv.put(MisaClient.KV_TOKEN_KEY, this.accessToken, {
      expirationTtl: ttlSeconds
    });
    this._initClient();

    return this.accessToken;
  }

  _getAuthHeaders() {
    return {
      "X-MISA-AccessToken": this.accessToken,
      "Content-Type": "application/json"
    };
  }

  /**
   * Save the Accounting Document Proposal to MISA
   * @param {*} voucherPayload
   * @returns
   */
  async saveVoucher(voucherPayload) {
    const response = await this.client.post("/apir/sync/actopen/save", voucherPayload);
    return response.data;
  }

  /**
   * Save dictionary to MISA
   * @param {*} dictionaryPayload
   * @returns
   */
  async saveDictionary(dictionaryPayload) {
    const response = await this.client.post("/apir/sync/actopen/save_dictionary", dictionaryPayload);
    return response.data;
  }

  /**
   * Return list of configured bank info in MISA
   * @param {Number} data_type - type of dictionary, check here https://actdocs.misa.vn/g2/graph/ACTOpenAPIHelp/index.html#3-3
   * @param {Number} skip
   * @returns
   */
  async getDictionary(data_type, skip = 0, take = RETRIEVABLE_LIMIT, last_sync_time = null) {
    const payload = {
      data_type, skip, take, last_sync_time,
      app_id: this.env.MISA_APP_ID
    };

    const response = await this.client.post("/apir/sync/actopen/get_dictionary", payload);
    return JSON.parse(response.data.Data);
  }
}
