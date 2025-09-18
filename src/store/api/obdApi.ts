import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export const obdApi = createApi({
  reducerPath: 'obdApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/proxy',
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
  tagTypes: ['OBD'],
  endpoints: (builder) => ({
    // OBD telemetry
    listObdTelemetry: builder.query<PaginatedResponse<any>, Record<string, string | number | boolean | undefined>>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null) params.set(k, String(v));
        });
        return `/fleet/obd-telemetry/?${params.toString()}`;
      },
      providesTags: ['OBD'],
    }),
    listObdTelemetryAggregated: builder.query<any, void>({
      query: () => `/fleet/obd-telemetry/?aggregated=true`,
      providesTags: ['OBD'],
    }),
    listObdTopErrors: builder.query<any, { limit?: number }>({
      query: ({ limit = 10 } = {}) => `/fleet/obd-telemetry/?top_errors=true&limit=${limit}`,
      providesTags: ['OBD'],
    }),
    getObdTelemetryById: builder.query<any, string>({
      query: (id) => `/fleet/obd-telemetry/${id}/`,
      providesTags: ['OBD'],
    }),

    // OBD devices
    listObdDevices: builder.query<PaginatedResponse<any>, void>({
      query: () => `/fleet/obd-devices/`,
      providesTags: ['OBD'],
    }),
    createObdDevice: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/obd-devices/`, method: 'POST', body }),
      invalidatesTags: ['OBD'],
    }),
    getObdDeviceById: builder.query<any, string>({
      query: (id) => `/fleet/obd-devices/${id}/`,
      providesTags: ['OBD'],
    }),
    updateObdDevice: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/obd-devices/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['OBD'],
    }),
    deleteObdDevice: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/obd-devices/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['OBD'],
    }),

    // OBD device utilities
    listObdDeviceDistinctValues: builder.query<any, { field: string }>({
      query: ({ field }) => `/fleet/obd-devices/distinct-values/?field=${field}`,
      providesTags: ['OBD'],
    }),
    updateObdCommunication: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/obd-devices/${id}/update-communication/`, method: 'POST', body }),
      invalidatesTags: ['OBD'],
    }),
  }),
});

export const {
  useListObdTelemetryQuery,
  useListObdTelemetryAggregatedQuery,
  useListObdTopErrorsQuery,
  useGetObdTelemetryByIdQuery,
  useListObdDevicesQuery,
  useCreateObdDeviceMutation,
  useGetObdDeviceByIdQuery,
  useUpdateObdDeviceMutation,
  useDeleteObdDeviceMutation,
  useListObdDeviceDistinctValuesQuery,
  useUpdateObdCommunicationMutation,
} = obdApi;
