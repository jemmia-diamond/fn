export default class BaseClient {
  constructor(env) {
    this.env = env;
    this.baseUrl = env.HARAVAN_API_BASE_URL;
    this.accessToken = env.HARAVAN_TOKEN;
  }

  async composeHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.accessToken}`
    };
  }

  async makeGetRequest(path, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${path}?${queryParams}`;
    const headers = await this.composeHeaders();
    const response = await fetch(url, { headers });
    return await this.postProcess(response);
  }

  async makePostRequest(path, data) {
    const url = `${this.baseUrl}${path}`;
    const headers = await this.composeHeaders();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data)
    });
    return await this.postProcess(response);
  }

  async postProcess(response) {
    if (!response.ok) {
      let error = null;
      try { error = await response.json(); } catch { /* non-JSON body */ }
      return {
        success: false,
        status: response.status,
        message: `Haravan API error: ${response.status} ${response.statusText}`,
        error
      };
    }
    return {
      success: true,
      status: response.status,
      message: "Success",
      data: await response.json()
    };
  }
}
