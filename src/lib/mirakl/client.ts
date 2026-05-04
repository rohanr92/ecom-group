// src/lib/mirakl/client.ts
// Mirakl Connect API client with OAuth token caching.

import type {
  MiraklTokenResponse,
  MiraklOrdersResponse,
  MiraklDocumentsResponse,
} from './types';

const AUTH_URL = process.env.MIRAKL_AUTH_URL || 'https://auth.mirakl.net/oauth/token';
const BASE_URL = process.env.MIRAKL_CONNECT_BASE_URL || 'https://miraklconnect.com/api';
const CLIENT_ID = process.env.MIRAKL_CONNECT_CLIENT_ID;
const CLIENT_SECRET = process.env.MIRAKL_CONNECT_CLIENT_SECRET;

let cachedToken: { token: string; expiresAt: number } | null = null;

export class MiraklError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'MiraklError';
    this.status = status;
    this.body = body;
  }
}

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('MIRAKL_CONNECT_CLIENT_ID and MIRAKL_CONNECT_CLIENT_SECRET must be set');
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new MiraklError(
      `Auth failed: ${res.status} ${res.statusText}`,
      res.status,
      text,
    );
  }

  const data = JSON.parse(text) as MiraklTokenResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  isRetry: boolean = false,
): Promise<T> {
  const token = await getAccessToken();
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });

  // Auto-retry on 401: token might be stale, clear cache and try once more
  if (res.status === 401 && !isRetry) {
    cachedToken = null;
    return apiRequest<T>(path, init, true);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new MiraklError(
      `Mirakl API ${res.status} ${res.statusText} on ${path}`,
      res.status,
      text,
    );
  }

  if (!text) return {} as T;
  return JSON.parse(text) as T;
}
// =====================================================================
// Public API methods
// =====================================================================

export async function testConnection(): Promise<{
  ok: boolean;
  message: string;
  details?: unknown;
}> {
  try {
    const result = await apiRequest<MiraklOrdersResponse>('/v2/orders?limit=1');
    return {
      ok: true,
      message: 'Connection successful',
      details: { orders_received: result.data?.length ?? 0 },
    };
  } catch (err) {
    if (err instanceof MiraklError) {
      return {
        ok: false,
        message: err.message,
        details: { status: err.status, body: err.body.slice(0, 500) },
      };
    }
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function listOrders(params: {
  updated_from?: string;
  limit?: number;
  page_token?: string;
  channel_type?: string;
  status?: string[];
} = {}): Promise<MiraklOrdersResponse> {
  const query = new URLSearchParams();
  if (params.updated_from) query.set('updated_from', params.updated_from);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.page_token) query.set('page_token', params.page_token);
  if (params.channel_type) query.set('channel_type', params.channel_type);
  if (params.status) params.status.forEach((s) => query.append('status', s));

  const qs = query.toString();
  return apiRequest<MiraklOrdersResponse>(`/v2/orders${qs ? `?${qs}` : ''}`);
}

export async function listOrderDocuments(params: {
  order_ids?: string[];
  types?: string[];
  updated_from?: string;
  limit?: number;
  page_token?: string;
}): Promise<MiraklDocumentsResponse> {
  const query = new URLSearchParams();
  if (params.order_ids?.length) query.set('order_ids', params.order_ids.join(','));
  if (params.types?.length) params.types.forEach((t) => query.append('types', t));
  if (params.updated_from) query.set('updated_from', params.updated_from);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.page_token) query.set('page_token', params.page_token);

  return apiRequest<MiraklDocumentsResponse>(
    `/v2/orders/documents?${query.toString()}`,
  );
}

export function resetTokenCache() {
  cachedToken = null;
}

// Generic helper for other modules (e.g. sync-orders) to make Mirakl API calls
// with the same auth + retry logic.
export async function callMiraklApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return apiRequest<T>(path, init);
}