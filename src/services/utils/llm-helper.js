import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Utility to create an OpenAI-compatible model instance using AI Proxy.
 *
 * @param {Object} env
 * @param {string} modelName Name of the model to use (defaults to GPT-5.4).
 * @returns {Promise<Object>} The AI model instance.
 */
export async function getOpenAICompatibleModel(env) {
  const token = await env.AI_PROXY_TOKEN_SECRET.get();
  const baseUrl = env.AI_PROXY_URL + "/v1";

  const provider = createOpenAICompatible({
    name: "jemmia-proxy",
    baseURL: baseUrl,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return provider;
}

export async function getGoogleGenerativeAIModel(env) {
  const token = await env.GEMINI_API_KEY_SECRET.get();
  const baseUrl = env.GOOGLE_GENERATIVE_AI_URL;

  const provider = createGoogleGenerativeAI({
    apiKey: token,
    baseURL: baseUrl
  });

  return provider;
}
