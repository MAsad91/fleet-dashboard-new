import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export const driversApi = createApi({
  reducerPath: 'driversApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
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
  tagTypes: ['Drivers', 'Dashboard'],
  endpoints: (builder) => ({
    // Dashboard stats
    getDriversDashboardStats: builder.query<any, void>({
      query: () => `/fleet/drivers/dashboard_stats/`,
      providesTags: ['Drivers'],
    }),

    // Drivers CRUD
    listDrivers: builder.query<PaginatedResponse<any>, { page?: number; search?: string; status?: string }>({
      query: ({ page, search, status } = {}) => {
        const params = new URLSearchParams();
        if (page !== undefined) params.set('page', String(page));
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        return `/fleet/drivers/?${params.toString()}`;
      },
      providesTags: ['Drivers'],
    }),
    createDriver: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/drivers/`, method: 'POST', body }),
      invalidatesTags: ['Drivers'],
    }),
    getDriverById: builder.query<any, string>({
      query: (driver_id) => `/fleet/drivers/${driver_id}/`,
      providesTags: ['Drivers'],
    }),
    updateDriver: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/drivers/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Drivers'],
    }),
    updateDriverAdvanced: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/drivers/${id}/update_driver/`, method: 'POST', body }),
      invalidatesTags: ['Drivers'],
    }),
    deleteDriver: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/drivers/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Drivers'],
    }),

    // Driver management
    suspendDrivers: builder.mutation<any, { ids: string[] }>({
      query: (body) => ({ url: `/fleet/drivers/suspend_drivers/`, method: 'POST', body }),
      invalidatesTags: ['Drivers'],
    }),
    exportDriversCsv: builder.query<any, { ids: string[] }>({
      query: ({ ids }) => `/fleet/drivers/export_drivers_csv/?ids=${ids.join(',')}`,
      providesTags: ['Drivers'],
    }),
  }),
});

export const {
  useGetDriversDashboardStatsQuery,
  useListDriversQuery,
  useCreateDriverMutation,
  useGetDriverByIdQuery,
  useUpdateDriverMutation,
  useUpdateDriverAdvancedMutation,
  useDeleteDriverMutation,
  useSuspendDriversMutation,
  useExportDriversCsvQuery,
} = driversApi;
