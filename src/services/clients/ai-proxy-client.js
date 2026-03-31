import { createAxiosClient } from "services/utils/http-client";

export default class AIProxyClient {
  #env;
  #token;
  #baseUrl;
  #model = "gpt-5.4";

  constructor(env) {
    this.#env = env;
  }

  async #getToken() {
    if (this.#token) return this.#token;

    try {
      const secretToken = await this.#env.AI_PROXY_TOKEN_SECRET?.get();
      this.#token = secretToken || this.#env.AI_PROXY_TOKEN;
    } catch {
      this.#token = this.#env.AI_PROXY_TOKEN;
    }

    return this.#token;
  }

  #getBaseUrl() {
    if (this.#baseUrl) return this.#baseUrl;

    const url = this.#env.AI_PROXY_URL || "https://aiproxy.jemmia.vn";
    this.#baseUrl = `${url}/v1`;

    return this.#baseUrl;
  }

  async #createClient() {
    const token = await this.#getToken();
    const baseUrl = this.#getBaseUrl();

    const client = createAxiosClient({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    return client;
  }

  async chatCompletions(content) {
    const client = await this.#createClient();
    const response = await client.post("/chat/completions", {
      model: this.#model,
      messages: [
        { role: "user", content }
      ]
    });
    return response.data;
  }
}

