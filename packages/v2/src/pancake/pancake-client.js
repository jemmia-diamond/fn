export default class PancakeClient {
  constructor(accessToken) {
    this.baseUrl = "https://pages.fm/api";
    this.accessToken = accessToken;
    this.headers = { "Content-Type": "application/json" };
  }

  async getPageAccessToken(pageId) {
    const params = new URLSearchParams({
      access_token: this.accessToken,
    });
    const path = `/v1/pages/${pageId}/generate_page_access_token?${params}`;
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
    });
    const data = await res.json();
    return data.page_access_token;
  }

  async postRequest(pageId, path, data) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const params = new URLSearchParams({
      page_access_token: pageAccessToken,
    });
    const res = await fetch(`${this.baseUrl}${path}?${params}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async getRequest(pageId, path, params = {}) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    const _params = new URLSearchParams({
      page_access_token: pageAccessToken,
      ...params,
    });
    const res = await fetch(`${this.baseUrl}${path}?${_params}`, {
      method: "GET",
    });
    return res.json();
  }

  async assignConversation(pageId, conversationId, assigneeIds) {
    const path = `/public_api/v1/pages/${pageId}/conversations/${conversationId}/assign`;
    const data = {
      assignee_ids: assigneeIds,
    };
    return await this.postRequest(pageId, path, data);
  }

  async getMessages(pageId, conversationId, customer_id) {
    const path = `/public_api/v1/pages/${pageId}/conversations/${conversationId}/messages`;
    return await this.getRequest(pageId, path, { customer_id: customer_id });
  }
}
