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

class BaseConnector {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.baseUrl = "https://apis.haravan.com/com";
    this.timeout = 30000;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.accessToken}`
    };
  }

  createClient() {
    const client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: this.getHeaders()
    });
    axiosRetry(client, RETRY_CONFIG);

    return client;
  }

  async request(method, endpoint, params = null, data = null) {
    const client = this.createClient();
    const config = { method, url: endpoint, params };

    if (data && method !== "GET") {
      config.data = data;
    }

    const response = await client.request(config);
    return response.data;
  }

  async get(endpoint, params = null) {
    return this.request("GET", endpoint, params);
  }

  async post(endpoint, data) {
    return this.request("POST", endpoint, null, data);
  }

  async put(endpoint, data) {
    return this.request("PUT", endpoint, null, data);
  }

  async delete(endpoint, data = null) {
    return this.request("DELETE", endpoint, null, data);
  }
}

export default BaseConnector;
