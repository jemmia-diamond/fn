// Debounce Service

export class DebounceService {
  /**
   * Debounce data and send to a queue
   *
   * @param {Object} env - Worker environment
   * @param {string} key - Unique key for the debounce operation
   * @param {*} data - Data to be debounced
   * @param {string} queueName - Name of the queue to send to
   * @param {number} delay - Debounce delay in milliseconds (optional)
   */
  static async debounceToQueue(env, key, data, queueName, delay = 3000) {
    try {
      const durableObjectId = env.DEBOUNCE.idFromName(key);
      const durableObject = env.DEBOUNCE.get(durableObjectId);

      const payload = {
        key,
        data,
        delay,
        queueName
      };

      const response = await durableObject.fetch(env.HOST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "DebounceService/1.0"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Debounce request failed: ${response.status} ${errorText}`);
      }

      return await response.json();

    } catch (error) {
      console.error("Failed to debounce data:", {
        error: error.message,
        key,
        data,
        queueName
      });

      throw error;
    }
  }
}
