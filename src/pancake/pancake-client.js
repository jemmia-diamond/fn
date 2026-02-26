export default class PancakeClient {
  constructor(accessToken) {
    this.baseUrl = "https://pages.fm/api";
    this.accessToken = accessToken;
    this.headers = { "Content-Type": "application/json" };
  }

  async safeFetch(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      if (typeof data === "object" && data && data.error_code === 102) {
        return data; // Allow 102 Invalid access_token to be handled by the services
      }
      throw new Error(`Pancake HTTP Error ${res.status}: ${typeof data === "object" ? JSON.stringify(data) : data}`);
    }

    return data;
  }

  async getPageAccessToken(pageId) {
    const params = new URLSearchParams({
      access_token: this.accessToken
    });
    const path = `/v1/pages/${pageId}/generate_page_access_token?${params}`;
    const data = await this.safeFetch(`${this.baseUrl}${path}`, {
      method: "POST"
    });
    return data?.page_access_token;
  }

  async postRequest(pageId, path, data) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    if (!pageAccessToken) return null;

    const params = new URLSearchParams({
      page_access_token: pageAccessToken
    });
    return await this.safeFetch(`${this.baseUrl}${path}?${params}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data)
    });
  }

  async getRequest(pageId, path, params = {}) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    if (!pageAccessToken) return null;

    const cleanParams = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        cleanParams[k] = v;
      }
    }

    const _params = new URLSearchParams({
      ...cleanParams,
      page_access_token: pageAccessToken
    });
    return await this.safeFetch(`${this.baseUrl}${path}?${_params}`, {
      method: "GET"
    });
  }

  async assignConversation(pageId, conversationId, assigneeIds) {
    const path = `/public_api/v1/pages/${pageId}/conversations/${conversationId}/assign`;
    const data = {
      assignee_ids: assigneeIds
    };
    return await this.postRequest(pageId, path, data);
  }

  async getMessages(pageId, conversationId, customer_id) {
    const path = `/public_api/v1/pages/${pageId}/conversations/${conversationId}/messages`;
    return await this.getRequest(pageId, path, { customer_id: customer_id });
  }

  async getPages() {
    const params = new URLSearchParams({
      access_token: this.accessToken
    });
    return await this.safeFetch(`${this.baseUrl}/v1/pages?${params}`);
  }

  async getConversations(pageId, sinceUnix, untilUnix, pageNumber) {
    const params = {
      since: sinceUnix,
      until: untilUnix,
      page_number: pageNumber,
      order_by: "updated_at"
    };
    return await this.getRequest(pageId, `/public_api/v1/pages/${pageId}/conversations`, params);
  }

  async getPageCustomers(pageId, sinceUnix, untilUnix, pageNumber, pageSize) {
    const params = {
      since: sinceUnix,
      until: untilUnix,
      page_number: pageNumber,
      page_size: pageSize,
      order_by: "updated_at"
    };
    return await this.getRequest(pageId, `/public_api/v1/pages/${pageId}/page_customers`, params);
  }

  async getPageUsers(pageId) {
    return await this.getRequest(pageId, `/public_api/v1/pages/${pageId}/users`);
  }

  async getPageTags(pageId) {
    return await this.getRequest(pageId, `/public_api/v1/pages/${pageId}/tags`);
  }
}
