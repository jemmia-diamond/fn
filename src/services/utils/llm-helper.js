import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { AI_MODELS } from "src/constants/ai-proxy";

/**
 * Utility to create an OpenAI-compatible model instance using AI Proxy.
 *
 * @param {Object} env
 * @param {string} modelName Name of the model to use (defaults to GPT-5.4).
 * @returns {Promise<Object>} The AI model instance.
 */
export async function getAIModel(env, modelName = AI_MODELS.GPT_5_4) {
  const token = (await env.AI_PROXY_TOKEN_SECRET?.get()) || env.AI_PROXY_TOKEN;
  const baseUrl = (env.AI_PROXY_URL || "https://aiproxy.jemmia.vn") + "/v1";

  const provider = createOpenAICompatible({
    name: "jemmia-proxy",
    baseURL: baseUrl,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return provider(modelName);
}
