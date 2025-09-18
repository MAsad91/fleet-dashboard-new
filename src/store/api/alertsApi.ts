import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface Alert {
  id: number;
  severity: string;
  title: string;
  vehicle: string;
  created_at: string;
  status: string;
}

export interface AlertsResponse {
  results: Alert[];
  count: number;
  next?: string;
  previous?: string;
}

export const alertsApi = createApi({
  reducerPath: 'alertsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.PROXY_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken') || 
                   (typeof document !== 'undefined' ? 
                    document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] : 
                    null);
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Alerts', 'Dashboard'],
  endpoints: (builder) => ({
    // Dashboard stats
    getAlertsDashboardStats: builder.query<any, void>({
      query: () => `/fleet/alerts/dashboard_stats/`,
      providesTags: ['Alerts'],
    }),

    // Alerts CRUD
    getActiveAlerts: builder.query<AlertsResponse, { status?: string; limit?: number }>({
      query: ({ status = 'active', limit = 5 }) => 
        `/fleet/alerts/?status=${status}&limit=${limit}`,
      providesTags: ['Alerts'],
    }),
    getAlerts: builder.query<AlertsResponse, { severity?: string; status?: string; vehicle?: string; system?: string; page?: number; limit?: number }>({
      query: ({ severity = '', status = '', vehicle = '', system = '', page, limit }) => {
        const params = new URLSearchParams();
        if (severity !== undefined) params.set('severity', severity);
        if (status !== undefined) params.set('status', status);
        if (vehicle !== undefined) params.set('vehicle', vehicle);
        if (system !== undefined) params.set('system', system);
        if (page !== undefined) params.set('page', String(page));
        if (limit !== undefined) params.set('limit', String(limit));
        return `/fleet/alerts/?${params.toString()}`;
      },
      providesTags: ['Alerts'],
    }),
    getAlertById: builder.query<Alert, number>({
      query: (alertId) => `/fleet/alerts/${alertId}/`,
      providesTags: ['Alerts'],
    }),
    updateAlert: builder.mutation<Alert, { id: number; body: Partial<Alert> }>({
      query: ({ id, body }) => ({ url: `/fleet/alerts/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Alerts'],
    }),

    // Alert actions
    markAlertsRead: builder.mutation<any, { ids: number[] }>({
      query: (body) => ({ url: `/fleet/alerts/mark_read/`, method: 'POST', body }),
      invalidatesTags: ['Alerts'],
    }),
    resolveAlertAction: builder.mutation<any, { id: number; resolution?: string }>({
      query: ({ id, resolution }) => ({ url: `/fleet/alerts/${id}/resolve/`, method: 'POST', body: resolution ? { resolution } : undefined }),
      invalidatesTags: ['Alerts'],
    }),
    acknowledgeAlert: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({ url: `/fleet/alerts/${id}/acknowledge/`, method: 'POST' }),
      invalidatesTags: ['Alerts'],
    }),
    ignoreAlert: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({ url: `/fleet/alerts/${id}/ignore/`, method: 'POST' }),
      invalidatesTags: ['Alerts'],
    }),
    resolveAlertLegacy: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({ url: `/fleet/alerts/resolve_alert/`, method: 'POST', body: { id } }),
      invalidatesTags: ['Alerts'],
    }),

    // Alert analytics
    getAlertsTrends: builder.query<any, void>({
      query: () => `/fleet/alerts/trends/`,
      providesTags: ['Alerts'],
    }),
  }),
});

export const {
  useGetAlertsDashboardStatsQuery,
  useGetActiveAlertsQuery,
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useUpdateAlertMutation,
  useMarkAlertsReadMutation,
  useResolveAlertActionMutation,
  useAcknowledgeAlertMutation,
  useIgnoreAlertMutation,
  useResolveAlertLegacyMutation,
  useGetAlertsTrendsQuery,
} = alertsApi;
