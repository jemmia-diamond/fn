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
  static #instance = null;

  static instance(env) {
    if (!this.#instance) {
      this.#instance = new AIHUBClient(env);
    }
    return this.#instance;
  }

  #bearerToken;
  #env;
  #axiosClient;

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

  async #getClient() {
    if (this.#axiosClient) return this.#axiosClient;

    const token = await this.#getBearerToken();

    this.#axiosClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    axiosRetry(this.#axiosClient, RETRY_CONFIG);

    return this.#axiosClient;
  }

  async makeRequest(endpoint, data = null) {
    const client = await this.#getClient();
    const response = await client.post(endpoint, data);
    return response.data;
  }
}
