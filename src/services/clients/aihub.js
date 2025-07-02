export default class AIHUBClient {
  #host = "https://aihub.jemmia.vn";
  #basePath = "/api";
  #bearerToken;
  #env;

  constructor(env) {
    this.#env = env;
  }

  async #getHeaders() {
    if (!this.#bearerToken) {
      this.#bearerToken = await this.#env.BEARER_TOKEN_SECRET.get();
    }

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.#bearerToken}`
    };
  }

  async makeRequest(endpoint, data = null) {
    const url = this.#host + this.#basePath + endpoint;
    const options = {
      method: "POST",
      headers: await this.#getHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`AIHub API request failed: ${error.message}`);
    }
  }
}
