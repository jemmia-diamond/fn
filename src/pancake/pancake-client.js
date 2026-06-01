import { createAxiosClient } from "services/utils/http-client";

export default class PancakeClient {
  constructor(env) {
    this.baseUrl = "https://pages.fm/api";
    if (typeof env === "string") {
      this.accessToken = env;
      this.pancakePatsConfig = "{}";
    } else {
      this.accessToken = env.PANCAKE_ACCESS_TOKEN;

      let combinedPats = {};
      for (let i = 1; i <= 20; i++) {
        const chunk = env[`PANCAKE_PATS_CONFIG_${i}`];
        if (chunk) {
          try {
            Object.assign(combinedPats, JSON.parse(chunk));
          } catch (e) {
            console.warn(`Failed to parse PANCAKE_PATS_CONFIG_${i}`, e);
          }
        } else {
          break;
        }
      }

      if (Object.keys(combinedPats).length === 0 && env.PANCAKE_PATS_CONFIG) {
        try { Object.assign(combinedPats, JSON.parse(env.PANCAKE_PATS_CONFIG)); } catch (e) {
          console.warn("Failed to parse PANCAKE_PATS_CONFIG", e);
        }
      }
      this.pancakePatsConfig = JSON.stringify(combinedPats);
    }

    this.client = createAxiosClient({
      baseURL: this.baseUrl,
      headers: { "Content-Type": "application/json" },
      timeout: 60000
    }, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000,
      shouldResetTimeout: true,
      retryCondition: (error) => {
        return error.response?.status === 429 || error.response?.status >= 500 || error.code === "ECONNABORTED";
      }
    });

    this.client.interceptors.response.use(
      (response) => {
        const data = response.data;
        if (data && data.success === false && data.error_code === 102) {
          return response;
        }
        return response;
      },
      (error) => {
        if (error.response && error.response.data) {
          const data = error.response.data;
          throw new Error(`Pancake API Error ${error.response.status}: ${typeof data === "object" ? JSON.stringify(data) : data}`);
        }
        throw error;
      }
    );
  }

  async getPageAccessToken(pageId) {
    let patConfig = {};
    try {
      patConfig = JSON.parse(this.pancakePatsConfig || "{}");
    } catch (e) {
      console.warn("Invalid PANCAKE_PATS_CONFIG JSON format:", e.message);
    }

    const pageAccessToken = patConfig[pageId];

    if (pageAccessToken) {
      return pageAccessToken;
    }

    console.warn(`Page Access Token for page ${pageId} not found in PANCAKE_PATS_CONFIG`);
    return null;
  }

  async generateNewPageAccessToken(pageId) {
    // Specifically used by the Token Refresher Cronjob to generate fresh PATs
    const params = new URLSearchParams({
      access_token: this.accessToken
    });
    const path = `/v1/pages/${pageId}/generate_page_access_token?${params}`;

    const response = await this.client.post(path);
    return response.data?.page_access_token;
  }

  async postRequest(pageId, path, data) {
    const pageAccessToken = await this.getPageAccessToken(pageId);
    if (!pageAccessToken) return null;

    const params = new URLSearchParams({
      page_access_token: pageAccessToken
    });

    const response = await this.client.post(`${path}?${params}`, data);
    return response.data;
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

    const response = await this.client.get(`${path}?${_params}`);
    return response.data;
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
    const response = await this.client.get(`/v1/pages?${params}`);
    return response.data;
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
