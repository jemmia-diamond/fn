import PancakeClient from "pancake/pancake-client";

class PancakeCacheImpl {
  private memoryCache = new Map<string, { data: any; expired_at: number }>();

  async getConversation(
    pancakeClient: PancakeClient,
    pageId: string,
    conversationId: string
  ): Promise<any> {
    const memoryKey = `${pageId}:${conversationId}`;
    const cached = this.memoryCache.get(memoryKey);
    if (cached && cached.expired_at > Date.now()) {
      return cached.data;
    }
    const pancakeData = await pancakeClient.getConversationById(pageId, conversationId);
    if (pancakeData) {
      this.memoryCache.set(memoryKey, {
        data: pancakeData,
        expired_at: Date.now() + 86400 * 1000 // Cache for 24 hours
      });
    }

    return pancakeData;
  }
}

export const PancakeCache = new PancakeCacheImpl();
