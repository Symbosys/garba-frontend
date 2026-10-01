import { apiRequest, toQueryString } from '../lib/api-client';
import type { AccountStatus, AdminDashboardData, AdminEvent, AdminUser, EventStatus, Paginated } from './types';

export const adminApi = {
  dashboard: () => apiRequest<AdminDashboardData>('/super-admin/dashboard'),
  users: (params: { role: 'PARTNER' | 'ORGANIZER'; status?: AccountStatus; search?: string; page: number; limit: number }) =>
    apiRequest<Paginated<AdminUser>>(`/super-admin/registrations${toQueryString(params)}`),
  user: (id: string) => apiRequest<AdminUser>(`/super-admin/registrations/${id}`),
  reviewUser: (id: string, body: { decision: 'APPROVE' } | { decision: 'REJECT'; reason: string }) =>
    apiRequest<{ id: string; status: AccountStatus }>(`/super-admin/registrations/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),
  events: (params: { status?: EventStatus; search?: string; page: number; limit: number }) =>
    apiRequest<Paginated<AdminEvent>>(`/super-admin/events${toQueryString(params)}`),
  event: (id: string) => apiRequest<AdminEvent>(`/super-admin/events/${id}`),
};
