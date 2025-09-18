import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface Trip {
  id: string;
  trip_id: string;
  vehicle: string;
  driver: string;
  status: string;
  actual_start_time: string;
  current_location?: string;
  latitude?: number;
  longitude?: number;
}

export interface TripsResponse {
  results: Trip[];
  count: number;
  next?: string;
  previous?: string;
}

export const tripsApi = createApi({
  reducerPath: 'tripsApi',
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
  tagTypes: ['Trips', 'Dashboard'],
  endpoints: (builder) => ({
    // Dashboard stats
    getTripsDashboardStats: builder.query<any, void>({
      query: () => `/fleet/trips/dashboard_stats/`,
      providesTags: ['Trips'],
    }),

    // Trips CRUD
    getActiveTrips: builder.query<TripsResponse, { status?: string; limit?: number }>({
      query: ({ status = 'in_progress', limit = 10 }) => 
        `/fleet/trips/?status=${status}&limit=${limit}`,
      providesTags: ['Trips'],
    }),
    getTrips: builder.query<TripsResponse, { status?: string; vehicle?: string; driver?: string; trip_id?: string; page?: number; limit?: number }>({
      query: ({ status = '', vehicle = '', driver = '', trip_id = '', page, limit }) => {
        const params = new URLSearchParams();
        if (status !== undefined) params.set('status', status);
        if (vehicle !== undefined) params.set('vehicle', vehicle);
        if (driver !== undefined) params.set('driver', driver);
        if (trip_id !== undefined) params.set('trip_id', trip_id);
        if (page !== undefined) params.set('page', String(page));
        if (limit !== undefined) params.set('limit', String(limit));
        return `/fleet/trips/?${params.toString()}`;
      },
      providesTags: ['Trips'],
    }),
    createTrip: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/trips/`, method: 'POST', body }),
      invalidatesTags: ['Trips', 'Dashboard'],
    }),
    getTripById: builder.query<any, string>({
      query: (tripId) => `/fleet/trips/${tripId}/`,
      providesTags: ['Trips'],
    }),
    updateTrip: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/trips/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Trips'],
    }),
    deleteTrip: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/trips/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Trips'],
    }),

    // Trip actions
    startTrip: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/trips/${id}/start/`, method: 'POST', body }),
      invalidatesTags: ['Trips', 'Dashboard'],
    }),
    endTrip: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/trips/${id}/end/`, method: 'POST', body }),
      invalidatesTags: ['Trips', 'Dashboard'],
    }),
    cancelTrip: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/trips/${id}/cancel/`, method: 'POST', body }),
      invalidatesTags: ['Trips', 'Dashboard'],
    }),
    commandTrip: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/trips/${id}/command/`, method: 'POST', body }),
      invalidatesTags: ['Trips'],
    }),
    bulkCancelTrips: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/trips/cancel_trips/`, method: 'POST', body }),
      invalidatesTags: ['Trips'],
    }),
  }),
});

export const {
  useGetTripsDashboardStatsQuery,
  useGetActiveTripsQuery,
  useGetTripsQuery,
  useCreateTripMutation,
  useGetTripByIdQuery,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useStartTripMutation,
  useEndTripMutation,
  useCancelTripMutation,
  useCommandTripMutation,
  useBulkCancelTripsMutation,
} = tripsApi;
