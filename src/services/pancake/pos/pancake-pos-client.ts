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
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: "https://pos.pages.fm/api/v1",
      params: { api_key: apiKey }
    });
  }

  async createOrder(shopId: number, payload: CreateOrderPayload): Promise<PancakePosOrder> {
    const response = await this.client.post(`/shops/${shopId}/orders`, payload);
    return response.data.order ?? response.data;
  }

  async updateOrderStatus(shopId: number, orderId: number, status: number): Promise<void> {
    await this.client.put(`/shops/${shopId}/orders/${orderId}`, { status });
  }

  async getShops(): Promise<PancakePosShop[]> {
    const response = await this.client.get("/shops");
    return response.data.shops ?? response.data ?? [];
  }
}
