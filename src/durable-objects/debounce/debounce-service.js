// Debounce Service

export class DebounceService {
  /**
   * Debounce data and execute a custom callback function
   *
   * @param {Object} env - Worker environment
   * @param {string} key - Unique key for the debounce operation
   * @param {*} data - Data to be debounced
   * @param {Function} callback - Callback function to execute after debounce delay
   * @param {number} delay - Debounce delay in milliseconds (optional)
   */
  static async debounce(env, key, data, actionType, delay) {
    try {
      const durableObjectId = env.DEBOUNCE.idFromName(key);
      const durableObject = env.DEBOUNCE.get(durableObjectId);

      await durableObject.debounce({ key, data, delay, actionType });
    } catch (error) {
      console.error("Failed to debounce data:", { error: error.message, key, data });
      throw error;
    }
  }
}
