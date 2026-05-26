import axios, { AxiosInstance } from "axios";

export interface PancakePosShop {
  id: number;
  name: string;
  pages: Array<{ id: string; platform: string; shop_id: number }>;
}

export interface OrderItem {
  variation_id: string;
  product_id: string;
  quantity: number;
  discount_each_product: number;
  variation_info: {
    name: string | null;
    retail_price: number;
  };
}

export interface CreateOrderPayload {
  bill_full_name?: string;
  bill_phone_number?: string;
  conversation_id?: string;
  note?: string;
  status?: number;
  shipping_fee?: number;
  ad_id?: string;
  page_id?: string;
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
  private apiKeySecret: any;
  private httpClient: AxiosInstance | null = null;

  constructor(apiKeySecret: any) {
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
    return response.data.data;
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
