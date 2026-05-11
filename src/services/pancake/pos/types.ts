export interface ResolvedLead {
  conversationId: string;
  pageId: string;
  adIds: string[];
}

export interface HaravanOrderPayload {
  id: number;
  name: string;
  haravan_topic: string;
  financial_status: string;
  fulfillment_status: string | null;
  customer_phone: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  shipping_lines?: Array<{ price?: number | string }> | null;
}
