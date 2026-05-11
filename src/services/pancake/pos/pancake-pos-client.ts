import axios, { AxiosInstance } from "axios";

export interface PancakePosShop {
  id: number;
  name: string;
  pages: Array<{ id: string; platform: string; shop_id: number }>;
}

export interface OrderItem {
  variation_id?: string;
  quantity: number;
  variation_info: {
    retail_price: number;
  };
}

export interface CreateOrderPayload {
  bill_full_name?: string;
  bill_phone_number?: string;
  note?: string;
  status?: number;
  total_discount?: number;
  shipping_fee?: number;
  ad_id?: string;
  page_id?: string;
  conversation_id?: string;
  items?: OrderItem[];
}

export interface PancakePosOrder {
  id: number;
  shop_id: number;
  status: number;
  bill_full_name?: string;
  bill_phone_number?: string;
  note?: string;
}

export default class PancakePosClient {
  private apiKeySecret: { get(): Promise<string> };
  private httpClient: AxiosInstance | null = null;

  constructor(apiKeySecret: { get(): Promise<string> }) {
    this.apiKeySecret = apiKeySecret;
  }

  private async getClient(): Promise<AxiosInstance> {
    if (!this.httpClient) {
      const apiKey = await this.apiKeySecret.get();
      this.httpClient = axios.create({
        baseURL: "https://pos.pages.fm/api/v1",
        params: { api_key: apiKey }
      });
    }
    return this.httpClient;
  }

  async createOrder(shopId: number, payload: CreateOrderPayload): Promise<PancakePosOrder> {
    const client = await this.getClient();
    const response = await client.post(`/shops/${shopId}/orders`, payload);
    return response.data.order ?? response.data;
  }

  async updateOrderStatus(shopId: number, orderId: number, status: number): Promise<void> {
    const client = await this.getClient();
    await client.put(`/shops/${shopId}/orders/${orderId}`, { status });
  }

  async getShops(): Promise<PancakePosShop[]> {
    const client = await this.getClient();
    const response = await client.get("/shops");
    return response.data.shops ?? response.data ?? [];
  }
}
