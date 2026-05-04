// src/lib/mirakl/types.ts
// TypeScript types for Mirakl Connect API responses

export interface MiraklTokenResponse {
  token_type: 'Bearer';
  access_token: string;
  expires_in: number;
  company_id?: string;
  company_kind?: string;
}

export interface MiraklAddress {
  first_name?: string;
  last_name?: string;
  street_1?: string;
  street_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  company?: string;
}

export interface MiraklCustomer {
  customer_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  shipping_address?: MiraklAddress;
  billing_address?: MiraklAddress;
}

export interface MiraklOrderLine {
  id: string;
  shop_sku?: string;
  offer_sku?: string;
  product_sku?: string;
  product_title?: string;
  quantity: number;
  price?: number;
  total_price?: number;
  status?: string;
  shipping_price?: number;
  taxes?: Array<{ amount: number; code?: string }>;
}

export interface MiraklOrder {
  id?: string;
  order_id?: string;
  commercial_id?: string;
  status: string;
  channel?: { id?: string; name?: string };
  channel_type?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  shipped_at?: string;
  customer?: MiraklCustomer;
  shipping_address?: MiraklAddress;
  billing_address?: MiraklAddress;
  order_lines?: MiraklOrderLine[];
  total_price?: number;
  total_commission?: number;
  shipping_price?: number;
  total_taxes?: number;
  currency?: string;
  shipping_method?: string;
  shipping_carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  [key: string]: unknown;
}

export interface MiraklOrdersResponse {
  data: MiraklOrder[];
  next_page_token?: string;
  previous_page_token?: string;
  total_count?: number;
}

export interface MiraklDocument {
  id: string;
  order_id: string;
  type: string;
  name?: string;
  download_url?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MiraklDocumentsResponse {
  data: MiraklDocument[];
  next_page_token?: string;
}