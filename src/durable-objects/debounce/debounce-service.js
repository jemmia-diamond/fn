export class MessageBatcherService {
  /**
   * Queue a message for debounced processing
   *
   * @param {Object} env - Worker environment
   * @param {Object} data - Message data to be debounced
   * @param {String} sendType - QUEUE value
   */
  static async queueMessage(env, data, sendType) {
    try {
      const conversationId = data?.data?.conversation?.id ;

      if (!conversationId) {
        throw new Error("Conversation ID is required for message batching");
      }

      const key = `conversation-${conversationId}`;

      // Get durable object instance
      const durableObjectId = env.MESSAGE_BATCHER.idFromName(key);
      const durableObject = env.MESSAGE_BATCHER.get(durableObjectId);

      const payload = {
        key,
        data,
        delay: env.DEFAULT_MESSAGE_DELAY,
        sendType
      };

      const response = await durableObject.fetch(env.HOST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "MessageBatcherService/1.0"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Durable Object request failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        key,
        result
      };

    } catch (error) {
      console.error("Failed to queue message for debouncing:", {
        error: error.message,
        data: data
      });

      throw error;
    }
  }
}
