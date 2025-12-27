import axios from "axios";
import axiosRetry from "axios-retry";

const DEFAULT_RETRY_CONFIG = {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status >= 500
};

/**
 * Create an axios client with retry logic
 * @param {Object} config - Axios configuration object
 * @param {string} config.baseURL - Base URL for the API
 * @param {number} config.timeout - Req timeout in milliseconds
 * @param {Object} config.headers - Req headers
 * @param {Object} [retryConfig] - Optional custom retry config
 * @returns {import('axios').AxiosInstance} Axios instance with retry logic configured
 */
export function createAxiosClient(config, retryConfig = null) {
  const client = axios.create(config);
  axiosRetry(client, retryConfig || DEFAULT_RETRY_CONFIG);
  return client;
}
