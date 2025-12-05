import axios from "axios";

/**
 * Base connector for Lark/Feishu API
 * Provides authentication and generic HTTP methods
 */
export default class LarkBaseConnector {
  /**
   * @param {string} appId - Lark App ID
   * @param {string} appSecret - Lark App Secret
   * @param {string} [accessToken] - Pre-existing access token (optional)
   * @param {string} [baseURL] - API base URL
   * @param {number} [timeout=30] - Request timeout in seconds
   */
  constructor(appId, appSecret, accessToken = null, baseURL = "https://open.larksuite.com/open-apis", timeout = 30) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.baseURL = baseURL;
    this.timeout = timeout * 1000; // Convert to milliseconds
    this.accessToken = accessToken || null;
    this.tokenExpiry = null;
  }

  /**
   * Get tenant access token (with caching)
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/auth/v3/tenant_access_token/internal`,
        {
          app_id: this.appId,
          app_secret: this.appSecret
        },
        { timeout: this.timeout }
      );

      if (response.data.code !== 0) {
        throw new Error(`Failed to get access token: ${response.data.msg}`);
      }

      this.accessToken = response.data.tenant_access_token;
      // Tokens expire in 2 hours, cache for 1.5 hours
      this.tokenExpiry = Date.now() + (90 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`, { cause: error });
    }
  }

  /**
   * Get request headers with authentication
   * @returns {Promise<object>} Headers object
   */
  async getHeaders() {
    const token = await this.getAccessToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Generic request method
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {object} [options] - Request options
   * @param {object} [options.params] - Query parameters
   * @param {object} [options.data] - Request body
   * @returns {Promise<any>} Response data
   */
  async request(method, endpoint, options = {}) {
    const headers = await this.getHeaders();
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await axios({
        method,
        url,
        headers,
        params: options.params,
        data: options.data,
        timeout: this.timeout
      });

      // Check Lark API response code
      if (response.data.code !== 0) {
        throw new Error(`Lark API error: ${response.data.msg} (code: ${response.data.code})`);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data?.msg || error.response.statusText;
        throw new Error(`API request failed: ${errorMsg}`, { cause: error });
      }
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} [params] - Query parameters
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, params = null) {
    return this.request("GET", endpoint, { params });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} [params] - Query parameters
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data, params = null) {
    return this.request("POST", endpoint, { data, params });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data) {
    return this.request("PUT", endpoint, { data });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint) {
    return this.request("DELETE", endpoint);
  }
}
