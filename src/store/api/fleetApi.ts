import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define types for our API responses
export interface DashboardSummary {
  total_vehicles: number;
  total_active_trips: number;
  open_maintenance: number;
  total_distance_travelled_km: number;
  average_battery_level: number;
  vehicle_status_breakdown: {
    available: number;
    in_use: number;
    maintenance: number;
  };
  obd_metrics: {
    average_speed_kph: number;
    average_motor_temp_c: number;
    average_estimated_range_km: number;
    average_battery_voltage: number;
    average_tire_pressure_kpa: number;
    vehicles_reporting_errors: number;
  };
  diagnostics: {
    device_health: {
      critical: number;
      warning: number;
      normal: number;
      total: number;
    };
    sim_cards: {
      high_usage: number;
      inactive: number;
      total: number;
    };
  };
  most_active_vehicle?: {
    vehicle_id: string;
    vehicle_name: string;
    total_distance: number;
    total_trips: number;
  };
}

export interface Alert {
  id: number;
  severity: string;
  title: string;
  vehicle: string;
  created_at: string;
  status: string;
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

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface AlertsResponse {
  results: Alert[];
  count: number;
  next?: string;
  previous?: string;
}

export interface TripsResponse {
  results: Trip[];
  count: number;
  next?: string;
  previous?: string;
}

// Create the API slice
export const fleetApi = createApi({
  reducerPath: 'fleetApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      // Get token from localStorage or cookies
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
  tagTypes: [
    'Dashboard',
    'Vehicles',
    'Drivers',
    'Trips',
    'Alerts',
    'Maintenance',
    'Dashcams',
    'VehicleDocuments',
    'VehicleTypes',
  ],
  endpoints: (builder) => ({
    // Dashboard summary (Postman uses date_range param)
    getDashboardSummary: builder.query<DashboardSummary, string>({
      query: (dateRange) => `/fleet/dashboard/summary/?date_range=${dateRange}`,
      providesTags: ['Dashboard'],
    }),

    // Dashboard stats blocks
    getVehiclesDashboardStats: builder.query<any, void>({
      query: () => `/fleet/vehicles/dashboard_stats/`,
      providesTags: ['Vehicles'],
    }),
    getDriversDashboardStats: builder.query<any, void>({
      query: () => `/fleet/drivers/dashboard_stats/`,
      providesTags: ['Drivers'],
    }),
    getTripsDashboardStats: builder.query<any, void>({
      query: () => `/fleet/trips/dashboard_stats/`,
      providesTags: ['Trips'],
    }),
    getAlertsDashboardStats: builder.query<any, void>({
      query: () => `/fleet/alerts/dashboard_stats/`,
      providesTags: ['Alerts'],
    }),
    getMaintenanceDashboardStats: builder.query<any, void>({
      query: () => `/fleet/scheduled-maintenance/dashboard_stats/`,
      providesTags: ['Maintenance'],
    }),
    getDashcamsDashboardStats: builder.query<any, void>({
      query: () => `/fleet/dashcams/dashboard_stats/`,
      providesTags: ['Dashcams'],
    }),
    
    // Alerts endpoints
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
    getAlertsTrends: builder.query<any, void>({
      query: () => `/fleet/alerts/trends/`,
      providesTags: ['Alerts'],
    }),
    
    // Trips endpoints
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
    // Vehicles endpoints
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

// Export hooks for usage in functional components
export const {
  useGetDashboardSummaryQuery,
  useGetVehiclesDashboardStatsQuery,
  useGetDriversDashboardStatsQuery,
  useGetTripsDashboardStatsQuery,
  useGetAlertsDashboardStatsQuery,
  useGetMaintenanceDashboardStatsQuery,
  useGetDashcamsDashboardStatsQuery,
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
} = fleetApi;
