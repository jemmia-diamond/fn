/**
 * Utility function to sleep for a specified number of milliseconds.
 * Useful for rate limiting API requests.
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
