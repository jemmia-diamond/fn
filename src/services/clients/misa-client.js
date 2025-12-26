import axios from "axios";
import axiosRetry from "axios-retry";

const RETRY_CONFIG = {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status >= 500
};

export default class MisaClient {
  static RETRIEVABLE_LIMIT = 1000;
  static KV_TOKEN_KEY = "misa:access_token";
  static TOKEN_TTL_HOURS = 11;

  constructor(env) {
    this.env = env;
    this.baseUrl = "https://actapp.misa.vn";
    this.accessToken = null;
    this.timeout = 10000;
  }

  _createClient() {
    const client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: this._getAuthHeaders()
    });

    axiosRetry(client, RETRY_CONFIG);
    return client;
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
      return this.accessToken;
    }

    const url = `${this.baseUrl}/api/oauth/actopen/connect`;
    const payload = {
      app_id: this.env.MISA_APP_ID,
      access_code: this.env.MISA_ACCESS_CODE,
      org_company_code: this.env.MISA_ORG_CODE
    };

    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" }
    });

    this.accessToken = JSON.parse(response.data.Data).access_token;

    const ttlSeconds = MisaClient.TOKEN_TTL_HOURS * 60 * 60;
    await kv.put(MisaClient.KV_TOKEN_KEY, this.accessToken, {
      expirationTtl: ttlSeconds
    });

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
    const client = this._createClient();
    const response = await client.post("/apir/sync/actopen/save", voucherPayload);
    return response.data;
  }

  /**
   * Save dictionary to MISA
   * @param {*} dictionaryPayload
   * @returns
   */
  async saveDictionary(dictionaryPayload) {
    const client = this._createClient();
    const response = await client.post("/apir/sync/actopen/save_dictionary", dictionaryPayload);
    return response.data;
  }

  /**
   * Return list of configured bank info in MISA
   * @param {Number} data_type - type of dictionary, check here https://actdocs.misa.vn/g2/graph/ACTOpenAPIHelp/index.html#3-3
   * @param {Number} skip
   * @returns
   */
  async getDictionary(data_type, skip = 0, take = RETRIEVABLE_LIMIT, last_sync_time = null) {
    const client = this._createClient();
    const payload = {
      data_type, skip, take, last_sync_time,
      app_id: this.env.MISA_APP_ID
    };

    const response = await client.post("/apir/sync/actopen/get_dictionary", payload);
    return JSON.parse(response.data.Data);
  }
}
