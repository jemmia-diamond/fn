import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { AI_MODELS } from "constants/ai-proxy";

export default class AIProxyClient {
  #env;
  #model;
  #token;
  #baseUrl;
  #provider;

  constructor(env, model) {
    this.#env = env;
    this.#model = model || AI_MODELS.GPT_5_4;
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

  async #getProvider() {
    if (this.#provider) return this.#provider;

    const token = await this.#getToken();
    const baseURL = this.#getBaseUrl();

    this.#provider = createOpenAICompatible({
      name: "jemmia-proxy",
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return this.#provider;
  }

  async translate(content) {
    const provider = await this.#getProvider();
    const { text: translatedText } = await generateText({
      model: provider(this.#model),
      prompt: content
    });

    return translatedText.trim();
  }
}

