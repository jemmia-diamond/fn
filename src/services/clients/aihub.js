import axios from "axios";
import axiosRetry from "axios-retry";

export default class AIHUBClient {
  #host = "https://aihub.jemmia.vn/api";
  #bearerToken;
  #env;

  constructor(env) {
    this.#env = env;
  }

  async #getHeaders() {
    if (!this.#bearerToken) {
      try {
        this.#bearerToken = await this.#env.BEARER_TOKEN_SECRET.get();
      } catch {
        // Fallback to BEARER_TOKEN environment variable
        this.#bearerToken = this.#env.BEARER_TOKEN;
      }
    }

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.#bearerToken}`
    };
  }

  async #getClient() {
    const client = axios.create({
      baseURL: this.#host,
      headers: await this.#getHeaders()
    });

    axiosRetry(client, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status >= 500;
      }
    });

    return client;
  }

  async makeRequest(endpoint, data = null) {
    const client = await this.#getClient();

    try {
      const response = await client.post(endpoint, data);

      return response.data;
    } catch (error) {
      throw new Error(`AIHub API request failed: ${error.message}`);
    }
  }
}
