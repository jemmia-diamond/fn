export default class HaravanClient {
  constructor(env) {
    this.baseUrl = env.HARAVAN_API_BASE_URL;
    this.accessToken = env.HARAVAN_TOKEN;
  }

  /**
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise<object>} API response
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.accessToken}`,
      ...options.headers
    };

    const requestOptions = {
      ...options,
      method: options.method,
      headers
    };

    if (options.body && typeof options.body === "object") {
      requestOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`Haravan API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Haravan API request failed:", error);
      throw error;
    }
  }
}
