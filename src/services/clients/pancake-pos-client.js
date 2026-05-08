import axios from "axios";
import axiosRetry from "axios-retry";

const RETRY_CONFIG = {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.response?.status >= 500 ||
    error.response?.status === 429
};

export default class PancakePOSClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://pos.pages.fm/api/v1";
    this.timeout = 60000;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json"
    };
  }

  createClient() {
    const client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: this.getHeaders()
    });
    axiosRetry(client, RETRY_CONFIG);

    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.data) {
          const data = error.response.data;
          throw new Error(`Pancake POS API Error ${error.response.status}: ${typeof data === "object" ? JSON.stringify(data) : data}`);
        }
        throw error;
      }
    );

    return client;
  }

  async request(method, endpoint, params = null, data = null) {
    const client = this.createClient();
    const finalParams = { api_key: this.apiKey, ...params };
    const config = { method, url: endpoint, params: finalParams };

    if (data && method !== "GET") {
      config.data = data;
    }

    const response = await client.request(config);

    // Pancake POS returns HTTP 200 even for logical errors
    // Check the `success` field explicitly
    if (response.data && response.data.success === false) {
      throw new Error(
        `Pancake POS Error ${response.data.error_code}: ${response.data.message}`
      );
    }

    return response.data;
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

  async getShop(shopId) {
    return this.get(`/shops/${shopId}`);
  }

  async getShops() {
    return this.get("/shops");
  }

  async createOrder(shopId, orderData) {
    return this.post(`/shops/${shopId}/orders`, orderData);
  }

  async getOrder(shopId, orderId) {
    return this.get(`/shops/${shopId}/orders/${orderId}`);
  }

  async getOrders(shopId, params = {}) {
    return this.get(`/shops/${shopId}/orders`, params);
  }

  async updateOrder(shopId, orderId, orderData) {
    return this.put(`/shops/${shopId}/orders/${orderId}`, orderData);
  }

  async cancelOrder(shopId, orderId, cancelData = {}) {
    return this.post(`/shops/${shopId}/orders/${orderId}/cancel`, cancelData);
  }

  async getProducts(shopId, params = {}) {
    return this.get(`/shops/${shopId}/products`, params);
  }

  async getProduct(shopId, productId) {
    return this.get(`/shops/${shopId}/products/${productId}`);
  }

  async getCustomers(shopId, params = {}) {
    return this.get(`/shops/${shopId}/customers`, params);
  }

  async getCustomerByPhone(shopId, phone) {
    return this.get(`/shops/${shopId}/customers`, { phone });
  }

  async createCustomer(shopId, customerData) {
    return this.post(`/shops/${shopId}/customers`, customerData);
  }

  async getWarehouses(shopId) {
    return this.get(`/shops/${shopId}/warehouses`);
  }

  async getConversations(pageId, params = {}) {
    return this.get(`/pages/${pageId}/conversations`, params);
  }
}
