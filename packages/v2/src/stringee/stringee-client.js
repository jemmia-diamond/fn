import { Jwt } from "hono/utils/jwt";

export default class StringeeClient {
  constructor(apiKeySID, apiKeySecret) {
    this.apiKeySID = apiKeySID;
    this.apiKeySecret = apiKeySecret;
    this.expBuffer = 3600;
    this.baseUrl = "https://api.stringee.com/v1";
  }

  async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.expBuffer;
    const payload = {
      jti: this.apiKeySID + "-" + now,
      iss: this.apiKeySID,
      exp: exp,
      rest_api: true,
    };
    const accessToken = await Jwt.sign(payload, this.apiKeySecret, "HS256");
    return accessToken;
  }

  async generateHeaders() {
    return {
      "X-STRINGEE-AUTH": await this.getAccessToken(),
    };
  }

  async getRequest(path, params = {}) {
    const url = `${this.baseUrl}${path}?${new URLSearchParams(params)}`;
    const res = await fetch(url, { headers: await this.generateHeaders() });
    return this.postProcess(res);
  }

  async getCallLogs(params = {}) {
    const path = "/call/log";
    const res = await this.getRequest(path, params);
    return res.calls;
  }

  async postProcess(res) {
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data.exc) throw new Error(data.exc);
      return data.data;
    } catch (e) {
      throw e;
    }
  }
}
