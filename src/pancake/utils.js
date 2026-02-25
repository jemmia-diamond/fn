/**
 * Checks Pancake API responses for the Invalid access_token error (102).
 *
 * @param {Object} data - The raw JSON response data from the Pancake API
 * @returns {boolean} True if the error is 102 Invalid access_token, false otherwise
 */
export function isInvalidTokenError(data) {
  return data && data.success === false && data.error_code === 102;
}
