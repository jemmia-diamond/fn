import axios from "axios";
import axiosRetry from "axios-retry";

const RETRY_CONFIG = {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status >= 500
};

export default class LarkBaseClient {
  #env;
  #appId;
  #appSecret;
  #accessToken;
  #tokenExpiry;
  #baseUrl;

  /**
   * @param {object} env
   */
  constructor(env) {
    this.#env = env;
    const endpoint = this.#env.LARK_API_ENDPOINT || "https://open.larksuite.com";
    this.#baseUrl = endpoint.endsWith("/open-apis") ? endpoint : `${endpoint}/open-apis`;
  }

  async #getAppCredentials() {
    if (this.#appId && this.#appSecret) {
      return { appId: this.#appId, appSecret: this.#appSecret };
    }

    this.#appId = this.#env.LARK_APP_ID;

    try {
      const secret = await this.#env.LARK_APP_SECRET_SECRET?.get();
      this.#appSecret = secret || this.#env.LARK_APP_SECRET;
    } catch {
      this.#appSecret = this.#env.LARK_APP_SECRET;
    }

    if (!this.#appId || !this.#appSecret) {
      throw new Error(`LARK_APP_ID or LARK_APP_SECRET is missing. AppID: ${this.#appId}, Secret defined: ${!!this.#appSecret}`);
    }

    return { appId: this.#appId, appSecret: this.#appSecret };
  }

  async #getAccessToken() {
    if (this.#accessToken && this.#tokenExpiry && Date.now() < this.#tokenExpiry - 300000) {
      return this.#accessToken;
    }

    const { appId, appSecret } = await this.#getAppCredentials();

    try {
      const response = await axios.post(
        `${this.#baseUrl}/auth/v3/tenant_access_token/internal`,
        {
          app_id: appId,
          app_secret: appSecret
        },
        { timeout: 30000 }
      );

      if (response.data.code !== 0) {
        throw new Error(`Failed to get access token: ${response.data.msg}`);
      }

      this.#accessToken = response.data.tenant_access_token;
      this.#tokenExpiry = Date.now() + (response.data.expire * 1000); // Usually 2 hours

      return this.#accessToken;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`, { cause: error });
    }
  }

  async #createClient() {
    const token = await this.#getAccessToken();

    const client = axios.create({
      baseURL: this.#baseUrl,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      timeout: 30000
    });

    axiosRetry(client, RETRY_CONFIG);

    return client;
  }

  /**
   * Generic request method using internal client
   */
  async #request(method, endpoint, options = {}) {
    const client = await this.#createClient();
    try {
      const response = await client.request({
        method,
        url: endpoint,
        params: options.params,
        data: options.data
      });

      if (response.data.code !== 0) {
        throw new Error(`Lark API error: ${response.data.msg} (code: ${response.data.code})`);
      }

      return response.data;
    } catch (error) {
      const context = `[${method}] ${endpoint}`;
      throw new Error(`Lark API Request Failed ${context}: ${error.message}`, {
        cause: error.response?.data || error
      });
    }
  }

  // Public methods

  async request(method, endpoint, options = {}) {
    return this.#request(method, endpoint, options);
  }

  async get(endpoint, params = null) {
    return this.#request("GET", endpoint, { params });
  }

  async post(endpoint, data, params = null) {
    return this.#request("POST", endpoint, { data, params });
  }

  async put(endpoint, data) {
    return this.#request("PUT", endpoint, { data });
  }

  async delete(endpoint) {
    return this.#request("DELETE", endpoint);
  }
}
