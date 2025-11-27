class BaseConnector {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.baseUrl = "https://apis.haravan.com/com";
    this.timeout = 30000;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.accessToken}`
    };
  }

  async request(method, endpoint, params = null, data = null) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    const options = {
      method,
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(this.timeout)
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;

      if (response.status === 429) {
        error.retryAfter = response.headers.get("retry-after");
      }

      throw error;
    }

    return response.json();
  }

  async get(endpoint, params = null) {
    return this.request("GET", endpoint, params);
  }

  async post(endpoint, data) {
    return this.request("POST", endpoint, null, data);
  }

  async put(endpoint, data) {
    return this.request("PUT", endpoint, null, data);
  }

  async delete(endpoint, data = null) {
    return this.request("DELETE", endpoint, null, data);
  }
}

export default BaseConnector;
