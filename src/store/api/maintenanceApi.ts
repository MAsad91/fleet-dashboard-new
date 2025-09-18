import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export const maintenanceApi = createApi({
  reducerPath: 'maintenanceApi',
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
  tagTypes: ['Maintenance', 'Dashboard'],
  endpoints: (builder) => ({
    // Dashboard stats
    getMaintenanceDashboardStats: builder.query<any, void>({
      query: () => `/fleet/scheduled-maintenance/dashboard_stats/`,
      providesTags: ['Maintenance'],
    }),

    // Scheduled maintenance CRUD
    listScheduledMaintenance: builder.query<PaginatedResponse<any>, { page?: number; status?: string }>({
      query: ({ page, status } = {}) => {
        const params = new URLSearchParams();
        if (page !== undefined) params.set('page', String(page));
        if (status) params.set('status', status);
        return `/fleet/scheduled-maintenance/?${params.toString()}`;
      },
      providesTags: ['Maintenance'],
    }),
    createScheduledMaintenance: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/scheduled-maintenance/`, method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    updateScheduledMaintenance: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/scheduled-maintenance/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Maintenance'],
    }),
    deleteScheduledMaintenance: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/scheduled-maintenance/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Maintenance'],
    }),

    // Maintenance actions
    markServiceDone: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/scheduled-maintenance/mark_service_done/`, method: 'POST', body: { id, ...(body || {}) } }),
      invalidatesTags: ['Maintenance'],
    }),
  }),
});

export const {
  useGetMaintenanceDashboardStatsQuery,
  useListScheduledMaintenanceQuery,
  useCreateScheduledMaintenanceMutation,
  useUpdateScheduledMaintenanceMutation,
  useDeleteScheduledMaintenanceMutation,
  useMarkServiceDoneMutation,
} = maintenanceApi;
