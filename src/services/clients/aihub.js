import axios from "axios";
import axiosRetry from "axios-retry";

const API_BASE_URL = "https://aihub.jemmia.vn/api";
const RETRY_CONFIG = {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status >= 500
};

export default class AIHUBClient {
  #bearerToken;
  #env;

  constructor(env) {
    this.#env = env;
  }

  async #getBearerToken() {
    if (this.#bearerToken) {
      return this.#bearerToken;
    }

    try {
      const secretToken = await this.#env.BEARER_TOKEN_SECRET?.get();
      this.#bearerToken = secretToken || this.#env.BEARER_TOKEN;
    } catch {
      this.#bearerToken = this.#env.BEARER_TOKEN;
    }

    if (!this.#bearerToken) {
      throw new Error("BEARER_TOKEN is not configured");
    }

    return this.#bearerToken;
  }

  async #createClient() {
    const token = await this.#getBearerToken();

    const client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    axiosRetry(client, RETRY_CONFIG);

    return client;
  }

  async makeRequest(endpoint, data = null) {
    const client = await this.#createClient();
    const response = await client.post(endpoint, data);
    return response.data;
  }
}
