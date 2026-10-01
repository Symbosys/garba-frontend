import { authStorage } from './auth-storage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');

interface ApiEnvelope<T> { success: boolean; message: string; data: T }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors?: unknown) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> & { errors?: unknown } | null;
  if (!response.ok) {
    if (response.status === 401) {
      authStorage.clear();
      window.dispatchEvent(new Event('garbamitra:unauthorized'));
    }
    throw new ApiError(payload?.message || 'Unable to complete the request', response.status, payload?.errors);
  }
  if (!payload?.success) throw new ApiError(payload?.message || 'Invalid server response', response.status);
  return payload.data;
}

export const toQueryString = (values: Record<string, string | number | boolean | null | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

