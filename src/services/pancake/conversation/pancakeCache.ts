import PancakeClient from "pancake/pancake-client";

const EXPIRED_CACHE_TIME = 86400; // 24 hours

class PancakeCacheImpl {
  async getMessageGlobalId(
    pancakeClient: PancakeClient,
    pageId: string,
    conversationId: string,
    env?: any
  ): Promise<string | null> {
    const kvKey = `pancake:conversation:${pageId}:${conversationId}`;

    if (env?.FN_KV) {
      const cachedGlobalId = await env.FN_KV.get(kvKey);
      if (cachedGlobalId) {
        return cachedGlobalId;
      }
    }

    const pancakeData = await pancakeClient.getConversationById(
      pageId,
      conversationId
    );
    const globalId = pancakeData?.global_id || null;

    if (globalId && env?.FN_KV) {
      await env.FN_KV.put(kvKey, globalId, {
        expirationTtl: EXPIRED_CACHE_TIME
      });
    }

    return globalId;
  }
}

export const PancakeCache = new PancakeCacheImpl();
