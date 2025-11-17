export default class BaseClient {
  constructor(env) {
    this.env = env;
    this.baseUrl = env.HARAVAN_API_BASE_URL;
    this.accessToken = env.HARAVAN_TOKEN_SECRET;
  }

  async composeHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${await this.accessToken.get()}`
    };
  }

  async makeGetRequest(path, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${path}?${queryParams}`;
    const headers = await this.composeHeaders();
    const response = await fetch(url, { headers });
    return await this.postProcess(response);
  }

  async makePostRequest(path, body = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = await this.composeHeaders();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    return await this.postProcess(response);
  }

  async postProcess(response) {
    if (!response.ok) {
      return {
        success: false,
        message: `Haravan API error: ${response.status} ${response.statusText}`
      };
    }
    return {
      success: true,
      message: "Success",
      data: await response.json()
    };
  }
}
