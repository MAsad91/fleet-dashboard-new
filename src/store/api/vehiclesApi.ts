import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export const vehiclesApi = createApi({
  reducerPath: 'vehiclesApi',
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
  tagTypes: ['Vehicles', 'VehicleDocuments', 'VehicleTypes', 'Dashboard', 'Maintenance'],
  endpoints: (builder) => ({
    // Dashboard stats
    getVehiclesDashboardStats: builder.query<any, void>({
      query: () => `/fleet/vehicles/dashboard_stats/`,
      providesTags: ['Vehicles'],
    }),

    // Vehicles CRUD
    listVehicles: builder.query<PaginatedResponse<any>, { fleet?: string; vehicle_type?: string; has_obd?: string; online?: string; health_status?: string; page?: number }>({
      query: (paramsInit) => {
        const params = new URLSearchParams();
        const { fleet, vehicle_type, has_obd, online, health_status, page } = paramsInit || {};
        if (fleet !== undefined) params.set('fleet', fleet);
        if (vehicle_type !== undefined) params.set('vehicle_type', vehicle_type);
        if (has_obd !== undefined) params.set('has_obd', has_obd);
        if (online !== undefined) params.set('online', online);
        if (health_status !== undefined) params.set('health_status', health_status);
        if (page !== undefined) params.set('page', String(page));
        return `/fleet/vehicles/?${params.toString()}`;
      },
      providesTags: ['Vehicles'],
    }),
    createVehicle: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/vehicles/`, method: 'POST', body }),
      invalidatesTags: ['Vehicles', 'Dashboard'],
    }),
    getVehicleById: builder.query<any, string>({
      query: (vehicleId) => `/fleet/vehicles/${vehicleId}/`,
      providesTags: ['Vehicles'],
    }),
    updateVehicle: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/vehicles/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Vehicles'],
    }),
    deleteVehicle: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/vehicles/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Vehicles'],
    }),

    // Vehicle telemetry and history
    getVehicleTelemetry: builder.query<any, { vehicle_id: string }>({
      query: ({ vehicle_id }) => `/fleet/vehicles/${vehicle_id}/telemetry_data/`,
      providesTags: ['Vehicles'],
    }),
    getVehicleHistory: builder.query<any, { vehicle_id: string; date_range?: string; include_details?: boolean; include_raw?: boolean; visualization?: string; category?: string; chart_points?: number; max_points?: number }>({
      query: ({ vehicle_id, ...others }) => {
        const params = new URLSearchParams();
        Object.entries(others).forEach(([k, v]) => {
          if (v !== undefined && v !== null) params.set(k, String(v));
        });
        return `/fleet/history/vehicle/${vehicle_id}/?${params.toString()}`;
      },
      providesTags: ['Vehicles'],
    }),

    // Vehicle maintenance
    setVehiclesForMaintenance: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/vehicles/set_for_maintenance/`, method: 'POST', body }),
      invalidatesTags: ['Vehicles', 'Maintenance'],
    }),
    retireVehicles: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/vehicles/retire_vehicles/`, method: 'POST', body }),
      invalidatesTags: ['Vehicles'],
    }),

    // Vehicle documents
    listVehicleDocuments: builder.query<PaginatedResponse<any>, void>({
      query: () => `/fleet/vehicle-documents/`,
      providesTags: ['VehicleDocuments'],
    }),
    createVehicleDocument: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/vehicle-documents/`, method: 'POST', body }),
      invalidatesTags: ['VehicleDocuments'],
    }),
    getVehicleDocumentById: builder.query<any, string>({
      query: (id) => `/fleet/vehicle-documents/${id}/`,
      providesTags: ['VehicleDocuments'],
    }),
    updateVehicleDocument: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/vehicle-documents/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['VehicleDocuments'],
    }),
    deleteVehicleDocument: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/vehicle-documents/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['VehicleDocuments'],
    }),

    // Vehicle types
    listVehicleTypes: builder.query<PaginatedResponse<any>, void>({
      query: () => `/fleet/vehicle-types/`,
      providesTags: ['VehicleTypes'],
    }),
  }),
});

export const {
  useGetVehiclesDashboardStatsQuery,
  useListVehiclesQuery,
  useCreateVehicleMutation,
  useGetVehicleByIdQuery,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehicleTelemetryQuery,
  useGetVehicleHistoryQuery,
  useSetVehiclesForMaintenanceMutation,
  useRetireVehiclesMutation,
  useListVehicleDocumentsQuery,
  useCreateVehicleDocumentMutation,
  useGetVehicleDocumentByIdQuery,
  useUpdateVehicleDocumentMutation,
  useDeleteVehicleDocumentMutation,
  useListVehicleTypesQuery,
} = vehiclesApi;
