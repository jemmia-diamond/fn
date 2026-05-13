export interface HaravanAddress {
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  company?: string | null;
  country?: string | null;
  country_code?: string | null;
  default?: boolean | null;
  district?: string | null;
  district_code?: string | null;
  first_name?: string | null;
  id?: number | null;
  last_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
  phone?: string | null;
  province?: string | null;
  province_code?: string | null;
  ward?: string | null;
  ward_code?: string | null;
  zip?: string | null;
}

export interface HaravanClientDetails {
  accept_language?: string | null;
  browser_height?: number | null;
  browser_ip?: string | null;
  browser_width?: number | null;
  session_hash?: string | null;
  user_agent?: string | null;
}

export interface HaravanCustomer {
  accepts_marketing?: boolean | null;
  addresses?: HaravanAddress[] | null;
  birthday?: string | null;
  created_at?: string | null;
  default_address?: HaravanAddress | null;
  email?: string | null;
  first_name?: string | null;
  gender?: string | null;
  id?: number | null;
  last_name?: string | null;
  last_order_date?: string | null;
  last_order_id?: number | null;
  last_order_name?: string | null;
  multipass_identifier?: string | null;
  note?: string | null;
  orders_count?: number | null;
  order_count?: number | null;
  phone?: string | null;
  state?: string | null;
  tags?: string | null;
  total_spent?: number | null;
  updated_at?: string | null;
  verified_email?: boolean | null;
}

export interface HaravanLineItemImage {
  src?: string | null;
  [key: string]: unknown;
}

export interface HaravanLineItem {
  actual_price?: number | null;
  applied_discounts?: unknown;
  barcode?: string | null;
  discount_allocations?: unknown;
  fulfillable_quantity?: number | null;
  fulfillment_service?: string | null;
  fulfillment_status?: string | null;
  gift_card?: boolean | null;
  grams?: number | null;
  id?: number | null;
  image?: HaravanLineItemImage | Record<string, unknown> | null;
  ma_cost_amount?: number | null;
  name?: string | null;
  not_allow_promotion?: boolean | null;
  price?: number | null;
  price_original?: number | null;
  price_promotion?: number | null;
  product_exists?: boolean | null;
  product_id?: number | null;
  properties?: unknown[] | null;
  quantity?: number | null;
  requires_shipping?: boolean | null;
  sku?: string | null;
  tax_lines?: unknown;
  taxable?: boolean | null;
  title?: string | null;
  total_discount?: number | null;
  type?: string | null;
  variant_id?: number | null;
  variant_title?: string | null;
  vendor?: string | null;
}

export interface HaravanTransaction {
  amount?: number | null;
  authorization?: string | null;
  created_at?: string | null;
  currency?: string | null;
  device_id?: string | null;
  external_payment_type?: string | null;
  external_transaction_id?: string | null;
  gateway?: string | null;
  haravan_transaction_id?: string | null;
  id?: number | null;
  kind?: string | null;
  location_id?: number | null;
  order_id?: number | null;
  parent_id?: number | null;
  payment_details?: unknown;
  receipt?: unknown;
  status?: string | null;
  user_id?: number | null;
}

export interface HaravanShippingLine {
  code?: string | null;
  price?: number | string | null;
  source?: string | null;
  title?: string | null;
}

export interface HaravanOrderPayload {
  assigned_location_at?: string | null;
  assigned_location_id?: number | null;
  assigned_location_name?: string | null;
  billing_address?: HaravanAddress | null;
  browser_ip?: string | null;
  buyer_accepts_marketing?: boolean | null;
  cancel_reason?: string | null;
  cancelled_at?: string | null;
  cancelled_status?: string | null;
  cart_token?: string | null;
  checkout_token?: string | null;
  client_details?: HaravanClientDetails | null;
  closed_at?: string | null;
  closed_status?: string | null;
  confirm_user?: number | null;
  confirmed_at?: string | null;
  confirmed_status?: string | null;
  contact_email?: string | null;
  created_at?: string | null;
  currency?: string | null;
  customer?: HaravanCustomer | null;
  discount_applications?: unknown;
  discount_codes?: unknown[] | null;
  email?: string | null;
  exported_confirm_at?: string | null;
  financial_status: string;
  fulfillment_status?: string | null;
  fulfillments?: unknown[] | null;
  gateway?: string | null;
  gateway_code?: string | null;
  haravan_topic: string;
  id: number;
  landing_site?: string | null;
  landing_site_ref?: string | null;
  line_items?: HaravanLineItem[] | null;
  location_id?: number | null;
  location_name?: string | null;
  name?: string | null;
  note?: string | null;
  note_attributes?: unknown[] | null;
  number?: number | null;
  order_number?: string | null;
  order_processing_status?: string | null;
  payment_url?: string | null;
  prev_order_date?: string | null;
  prev_order_id?: number | null;
  prev_order_number?: string | null;
  processing_method?: string | null;
  redeem_model?: unknown | null;
  referring_site?: string | null;
  ref_order_date?: string | null;
  ref_order_id?: number | null;
  ref_order_number?: string | null;
  refunds?: unknown[] | null;
  risk_level?: string | null;
  shipping_address?: HaravanAddress | null;
  shipping_lines?: HaravanShippingLine[] | null;
  source?: string | null;
  source_name?: string | null;
  subtotal_price?: number | string | null;
  tags?: string | null;
  tax_lines?: unknown;
  taxes_included?: boolean | null;
  token?: string | null;
  total_discounts?: number | string | null;
  total_line_items_price?: number | string | null;
  total_price?: number | string | null;
  total_tax?: number | string | null;
  total_weight?: number | string | null;
  transactions?: HaravanTransaction[] | null;
  updated_at?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_medium?: string | null;
  utm_source?: string | null;
  utm_term?: string | null;
  user_id?: number | null;
  device_id?: string | null;
}
