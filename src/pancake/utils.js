/**
 * Checks Pancake API responses for the Invalid access_token error (102).
 *
 * @param {Object} data - The raw JSON response data from the Pancake API
 * @returns {boolean} True if the error is 102 Invalid access_token, false otherwise
 */
export function isInvalidTokenError(data) {
  return data && data.success === false && data.error_code === 102;
}

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
