class BaseConnector {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.baseUrl = "https://apis.haravan.com/com";
    this.timeout = 30000;
    this.retryTimeout = 5000;
    this.maxRetries = 2;
    this.retryDelay = 1000;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const timeoutDuration = attempt === 0 ? this.timeout : this.retryTimeout;
        const options = {
          method,
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(timeoutDuration)
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
      } catch (error) {
        lastError = error;
        const isTimeout = error.name === "TimeoutError" ||  error.name === "AbortError" ||
                          error.message?.includes("timeout") || error.message?.includes("aborted");

        if (isTimeout && attempt < this.maxRetries) {
          await this.sleep(this.retryDelay);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
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
