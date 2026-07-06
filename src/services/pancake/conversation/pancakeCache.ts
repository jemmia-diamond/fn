import PancakeClient from "pancake/pancake-client";

class PancakeCacheImpl {
  async getConversation(
    pancakeClient: PancakeClient,
    pageId: string,
    conversationId: string,
    env?: any
  ): Promise<any> {
    const kvKey = `pancake:conversation:${pageId}:${conversationId}`;
    let pancakeData: any = null;

    if (env?.FN_KV) {
      try {
        pancakeData = await env.FN_KV.get(kvKey, "json");
      } catch (e) {
        console.warn("Failed to read from KV cache", e);
      }
    }

    if (!pancakeData) {
      pancakeData = await pancakeClient.getConversationById(pageId, conversationId);
      if (pancakeData && env?.FN_KV) {
        try {
          await env.FN_KV.put(kvKey, JSON.stringify(pancakeData), {
            expirationTtl: 86400 // Cache for 24 hours
          });
        } catch (e) {
          console.warn("Failed to write to KV cache", e);
        }
      }
    }

    return pancakeData;
  }
}

export const PancakeCache = new PancakeCacheImpl();
