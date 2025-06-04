export default class BaseClient {
  constructor({ appId, appSecret }) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.baseUrl = "https://open.larksuite.com/open-apis";
  }

  async getTenantAccessToken() {
    const url = "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal";
    const headers = {
      "Content-Type": "application/json; charset=utf-8"
    };
    const payload = {
      "app_id": this.appId,
      "app_secret": this.appSecret
    };
    const reponse = await fetch(
      url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      }
    );
    const json = await reponse.json();
    this.tenantAccessToken = json.tenant_access_token;
    return json.tenant_access_token;
  }

  async postRequest(path = "", data = {}) {
    const tenantAccessToken = await this.getTenantAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tenantAccessToken}`
      },
      body: JSON.stringify(data)
    });
    return await this.postProcess(res);
  }

  async getRequest(path = "", params = {}) {
    const tenantAccessToken = await this.getTenantAccessToken();
    const res = await fetch(`${this.baseUrl}${path}?${new URLSearchParams(params)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${tenantAccessToken}`
      }
    });
    return await this.postProcess(res);
  }

  async postProcess(res) {
    const json = await res.json();
    if (json.msg != "success") {
      throw new Error(json.msg);
    }
    return json.data;
  }

}
