import axios from "axios";
import axiosRetry from "axios-retry";

const RETRY_CONFIG = {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status >= 500
};

export default class NocoDBClient {
  #env;
  #apiToken;
  #baseUrl;

  /**
   * @param {object} env
   */
  constructor(env) {
    this.#env = env;
  }

  async #getApiToken() {
    if (this.#apiToken) {
      return this.#apiToken;
    }

    try {
      const secretToken = await this.#env.NOCODB_API_TOKEN_SECRET?.get();
      this.#apiToken = secretToken || this.#env.NOCODB_API_TOKEN;
    } catch {
      this.#apiToken = this.#env.NOCODB_API_TOKEN;
    }

    if (!this.#apiToken) {
      console.warn("NocoDBClient: apiToken is missing.");
    }

    return this.#apiToken;
  }

  async #getBaseUrl() {
    if (this.#baseUrl) return this.#baseUrl;

    const url = this.#env.NOCODB_WORKPLACE_BASE_URL || "https://app.nocodb.com";
    this.#baseUrl = url.replace(/\/$/, "");
    return this.#baseUrl;
  }

  async #createClient() {
    const token = await this.#getApiToken();
    const baseUrl = await this.#getBaseUrl();

    const client = axios.create({
      baseURL: baseUrl,
      headers: {
        "xc-token": token
      }
    });

    axiosRetry(client, RETRY_CONFIG);

    return client;
  }

  /**
   * Helper to make requests using the configured client
   * @param {string} method - HTTP method
   * @param {string} url - Relative URL
   * @param {object} [config] - Axios config
   */
  async #request(method, url, config = {}) {
    const client = await this.#createClient();
    try {
      const response = await client.request({
        method,
        url,
        ...config
      });
      return response.data;
    } catch (error) {
      const context = `[${method}] ${url}`;
      throw new Error(`NocoDB Request Failed ${context}: ${error.message}`, {
        cause: error.response?.data || error
      });
    }
  }

  async listRecords(tableId, params = {}) {
    return this.#request("GET", `/api/v2/tables/${tableId}/records`, { params });
  }

  async readRecord(tableId, recordId, params = {}) {
    return this.#request("GET", `/api/v2/tables/${tableId}/records/${recordId}`, { params });
  }

  async createRecords(tableId, data) {
    return this.#request("POST", `/api/v2/tables/${tableId}/records`, { data });
  }

  async updateRecords(tableId, data) {
    return this.#request("PATCH", `/api/v2/tables/${tableId}/records`, { data });
  }

  async deleteRecords(tableId, data) {
    return this.#request("DELETE", `/api/v2/tables/${tableId}/records`, { data });
  }

  async countRecords(tableId, params = {}) {
    return this.#request("GET", `/api/v2/tables/${tableId}/records/count`, { params });
  }

  async upsert(tableId, data, params = {}) {

    const records = await this.listRecords(tableId, { where: params.where, limit: 1 });
    if (records.list && records.list.length > 0) {
      // Update
      const record = records.list[0];
      // Need ID to update
      if (record.Id) {
        return this.updateRecords(tableId, { Id: record.Id, ...data });
      }
    }
    // Create if not found
    return this.createRecords(tableId, data);
  }

  async listLinkedRecords(tableId, linkFieldId, recordId, params = {}) {
    return this.#request("GET", `/api/v2/tables/${tableId}/links/${linkFieldId}/records/${recordId}`, { params });
  }

  async linkRecords(tableId, linkFieldId, recordId, data) {
    return this.#request("POST", `/api/v2/tables/${tableId}/links/${linkFieldId}/records/${recordId}`, { data });
  }

  async unlinkRecords(tableId, linkFieldId, recordId, data) {
    return this.#request("DELETE", `/api/v2/tables/${tableId}/links/${linkFieldId}/records/${recordId}`, { data });
  }

  async uploadAttachment(params, fileData) {
    // For FormData headers
    const headers = fileData.getHeaders ? fileData.getHeaders() : {};
    return this.#request("POST", "/api/v2/storage/upload", {
      params,
      data: fileData,
      headers
    });
  }
}
