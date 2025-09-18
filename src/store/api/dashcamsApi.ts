import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export const dashcamsApi = createApi({
  reducerPath: 'dashcamsApi',
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
  tagTypes: ['Dashcams', 'Dashboard'],
  endpoints: (builder) => ({
    // Dashboard stats
    getDashcamsDashboardStats: builder.query<any, void>({
      query: () => `/fleet/dashcams/dashboard_stats/`,
      providesTags: ['Dashcams'],
    }),

    // Dashcams CRUD
    listDashcams: builder.query<PaginatedResponse<any>, { page?: number; status?: string }>({
      query: ({ page, status } = {}) => {
        const params = new URLSearchParams();
        if (page !== undefined) params.set('page', String(page));
        if (status) params.set('status', status);
        return `/fleet/dashcams/?${params.toString()}`;
      },
      providesTags: ['Dashcams'],
    }),
    createDashcam: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/dashcams/`, method: 'POST', body }),
      invalidatesTags: ['Dashcams'],
    }),
    getDashcamById: builder.query<any, string>({
      query: (id) => `/fleet/dashcams/${id}/`,
      providesTags: ['Dashcams'],
    }),
    updateDashcam: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/dashcams/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Dashcams'],
    }),
    deleteDashcam: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/dashcams/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Dashcams'],
    }),

    // Dashcam actions
    refreshDashcamApiKey: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/dashcams/refresh_api_key/`, method: 'POST', body: { id } }),
      invalidatesTags: ['Dashcams'],
    }),
  }),
});

export const {
  useGetDashcamsDashboardStatsQuery,
  useListDashcamsQuery,
  useCreateDashcamMutation,
  useGetDashcamByIdQuery,
  useUpdateDashcamMutation,
  useDeleteDashcamMutation,
  useRefreshDashcamApiKeyMutation,
} = dashcamsApi;
