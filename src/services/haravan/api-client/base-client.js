import { createAxiosClient, DEFAULT_RETRY_CONFIG } from "services/utils/http-client";

export default class BaseClient {
  constructor(env) {
    this.env = env;
    this.client = createAxiosClient(
      {
        baseURL: env.HARAVAN_API_BASE_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.HARAVAN_TOKEN}`
        }
      },
      {
        ...DEFAULT_RETRY_CONFIG,
        retryCondition: (error) => error.response?.status >= 500
      }
    );
  }

  async makeGetRequest(path, params = {}) {
    try {
      const response = await this.client.get(path, { params });
      return { success: true, status: response.status, message: "Success", data: response.data };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        message: `Haravan API error: ${error.response?.status} ${error.response?.statusText}`,
        error: error.response?.data || null
      };
    }
  }

  async makePostRequest(path, data) {
    try {
      const response = await this.client.post(path, data);
      return { success: true, status: response.status, message: "Success", data: response.data };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        message: `Haravan API error: ${error.response?.status} ${error.response?.statusText}`,
        error: error.response?.data || null
      };
    }
  }
}
