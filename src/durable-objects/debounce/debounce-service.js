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

      await durableObject.debounce({ key, data, delay, queueName });
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
