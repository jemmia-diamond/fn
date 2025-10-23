export default class HaravanClient {
  constructor(accessToken, baseUrl) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  //Method to call Haravan API endpoints
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = this.accessToken;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    };

    const requestOptions = {
      ...options,
      method: options.method,
      headers,
    };

    if (options.body && typeof options.body === "object") {
      requestOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(
          `Haravan API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Haravan API request failed:", error);
      throw error;
    }
  }
}
