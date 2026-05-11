import axios from "axios";

export interface CreateOrderPayload {
  bill_full_name?: string;
  bill_phone_number?: string;
  note?: string;
  status?: number;
  total_discount?: number;
  shipping_fee?: number;
  items?: OrderItem[];
}

export interface OrderItem {
  variation_id?: number;
  quantity: number;
  price: number;
  discount_each_product?: number;
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
  private baseUrl = "https://pages.fm/api/v1";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createOrder(shopId: number, payload: CreateOrderPayload): Promise<PancakePosOrder> {
    const url = `${this.baseUrl}/shops/${shopId}/orders`;
    const response = await axios.post(url, payload, {
      headers: { "X-API-KEY": this.apiKey }
    });
    return response.data.order ?? response.data;
  }

  async updateOrderStatus(shopId: number, orderId: number, status: number): Promise<void> {
    const url = `${this.baseUrl}/shops/${shopId}/orders/${orderId}`;
    await axios.put(url, { status }, {
      headers: { "X-API-KEY": this.apiKey }
    });
  }

  async getShops(): Promise<PancakePosShop[]> {
    const url = `${this.baseUrl}/shops`;
    const response = await axios.get(url, {
      headers: { "X-API-KEY": this.apiKey }
    });
    return response.data.shops ?? response.data ?? [];
  }
}

export interface PancakePosShop {
  id: number;
  name: string;
  pages: Array<{ id: string; platform: string; shop_id: number }>;
}
