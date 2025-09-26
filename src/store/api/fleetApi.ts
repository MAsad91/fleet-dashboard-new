import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';

// Define types for our API responses - Updated to match postman collection specification
export interface DashboardSummary {
  total_vehicles: number;
  online_vehicles: number;
  total_active_trips: number;
  critical_alerts: number;
  open_maintenance: number;
  average_battery_level: number;
  total_distance_travelled_km: number;
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
    id: number;
    license_plate: string;
    total_distance_km: number;
  };
}

export interface Alert {
  id: number;
  alert_type: string;
  system: string;
  vehicle: number | string | {
    id: number;
    license_plate: string;
    make?: string;
    model?: string;
    vin?: string;
    name?: string;
  };
  obd_device?: number;
  driver: number | string | {
    id: number;
    name?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    display_name?: string;
  };
  title: string;
  message: string;
  severity: string;
  read: boolean;
  ignored: boolean;
  resolved: boolean;
  resolved_at?: string;
  status_label: string;
  vehicle_info?: {
    license_plate?: string;
    make?: string;
    model?: string;
    vin?: string;
    name?: string;
  };
  device_id?: string;
  created_at: string;
  updated_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  // Legacy fields for backward compatibility
  description?: string;
  priority?: string;
  source?: string;
  category?: string;
  tags?: string;
  location?: string;
  mileage?: number;
  status?: string;
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
    baseUrl: API_CONFIG.PROXY_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage or cookies - check both access_token and authToken
      const token = localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken') ||
                   (typeof document !== 'undefined' ? 
                    document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] : 
                    null);
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      // Add company name header if available
      const companyName = localStorage.getItem('company_name');
      if (companyName) {
        headers.set('X-Company-Name', companyName);
      }
      
      return headers;
    },
  }),
  tagTypes: [
    'Dashboard',
    'Vehicles',
    'Drivers',
    'DriverDocuments',
    'Trips',
    'Telemetry',
    'Alerts',
    'AlertRules',
    'Maintenance',
    'Insurance',
    'Dashcams',
    'VideoSegments',
    'VehicleDocuments',
    'VehicleTypes',
    'FleetOperators',
    'OBDDevices',
    'SimCards',
    'Analytics',
    'Firmware',
    'Performance',
    'FleetSettings',
  ],
  endpoints: (builder) => ({
    // Dashboard summary (Postman uses date_range param)
    getDashboardSummary: builder.query<DashboardSummary, string>({
      query: (dateRange) => `/fleet/dashboard/summary/?date_range=${dateRange}`,
      providesTags: ['Dashboard'],
    }),

    // Dashboard stats blocks
    getVehiclesDashboardStats: builder.query<any, { dateRange?: string; startDate?: string; endDate?: string }>({
      query: ({ dateRange = 'today', startDate, endDate }) => ({
        url: `/fleet/vehicles/dashboard_stats/`,
        params: startDate && endDate
          ? { start_date: startDate, end_date: endDate }
          : { date_range: dateRange }
      }),
      providesTags: ['Vehicles'],
    }),
    getDriversDashboardStats: builder.query<any, { dateRange?: string; startDate?: string; endDate?: string }>({
      query: ({ dateRange = 'today', startDate, endDate }) => ({
        url: `/fleet/drivers/dashboard_stats/`,
        params: startDate && endDate
          ? { start_date: startDate, end_date: endDate }
          : { date_range: dateRange }
      }),
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
    getDashcamsDashboardStats: builder.query<any, { dateRange?: string; startDate?: string; endDate?: string }>({
      query: ({ dateRange = 'today', startDate, endDate }) => ({
        url: `/fleet/dashcams/dashboard_stats/`,
        params: startDate && endDate
          ? { start_date: startDate, end_date: endDate }
          : { date_range: dateRange }
      }),
      providesTags: ['Dashcams'],
    }),
    getScheduledMaintenanceDashboardStats: builder.query<any, void>({
      query: () => `/fleet/scheduled-maintenance/dashboard_stats/`,
      providesTags: ['Maintenance'],
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
        // Add parameters to include related data
        params.set('include', 'driver,vehicle');
        params.set('expand', 'driver,vehicle');
        return `/fleet/alerts/?${params.toString()}`;
      },
      providesTags: ['Alerts'],
    }),
    getAlertById: builder.query<Alert, number>({
      query: (alertId) => `/fleet/alerts/${alertId}/`,
      providesTags: ['Alerts'],
    }),
    createAlert: builder.mutation<Alert, any>({
      query: (body) => ({ url: `/fleet/alerts/`, method: 'POST', body }),
      invalidatesTags: ['Alerts'],
    }),
    updateAlert: builder.mutation<Alert, { id: number; body: Partial<Alert> }>({
      query: ({ id, body }) => ({ url: `/fleet/alerts/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Alerts'],
    }),
    deleteAlert: builder.mutation<any, number>({
      query: (id) => ({ url: `/fleet/alerts/${id}/`, method: 'DELETE' }),
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
    getAlertsTrends: builder.query<any, { dateRange?: string; startDate?: string; endDate?: string }>({
      query: ({ dateRange = 'today', startDate, endDate }) => ({
        url: `/fleet/alerts/trends/`,
        params: startDate && endDate 
          ? { start_date: startDate, end_date: endDate }
          : { date_range: dateRange }
      }),
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

    // Telemetry endpoints
    getObdTelemetry: builder.query<any, { vehicle_id?: string; device_id?: string; date_range?: string; start_date?: string; end_date?: string }>({
      query: (paramsInit) => {
        const params = new URLSearchParams();
        const { vehicle_id, device_id, date_range, start_date, end_date } = paramsInit || {};
        if (vehicle_id !== undefined) params.set('vehicle_id', vehicle_id);
        if (device_id !== undefined) params.set('device_id', device_id);
        if (date_range !== undefined) params.set('date_range', date_range);
        if (start_date !== undefined) params.set('start_date', start_date);
        if (end_date !== undefined) params.set('end_date', end_date);
        return `/fleet/obd-telemetry/?${params.toString()}`;
      },
      providesTags: ['Telemetry'],
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

    // Driver endpoints
    getDrivers: builder.query<any, { page?: number; limit?: number; search?: string; status?: string }>({
      query: ({ page = 1, limit = 10, search = '', status = '' }) => {
        const params = new URLSearchParams();
        if (page !== undefined) params.set('page', String(page));
        if (limit !== undefined) params.set('limit', String(limit));
        if (search !== undefined) params.set('search', search);
        if (status !== undefined) params.set('status', status);
        return `/fleet/drivers/?${params.toString()}`;
      },
      providesTags: ['Drivers'],
    }),
    getDriverById: builder.query<any, string>({
      query: (driverId) => `/fleet/drivers/${driverId}/`,
      providesTags: ['Drivers'],
    }),
    createDriver: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/drivers/`, method: 'POST', body }),
      invalidatesTags: ['Drivers'],
    }),
    updateDriver: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/drivers/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Drivers'],
    }),
    deleteDriver: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/drivers/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Drivers'],
    }),

    // Driver Documents endpoints
    getDriverDocuments: builder.query<any, void>({
      query: () => `/fleet/driver-documents/`,
      providesTags: ['DriverDocuments'],
    }),
    createDriverDocument: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/driver-documents/`, method: 'POST', body }),
      invalidatesTags: ['DriverDocuments'],
    }),
    getDriverDocumentById: builder.query<any, string>({
      query: (id) => `/fleet/driver-documents/${id}/`,
      providesTags: ['DriverDocuments'],
    }),
    updateDriverDocument: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/driver-documents/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['DriverDocuments'],
    }),
    deleteDriverDocument: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/driver-documents/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['DriverDocuments'],
    }),

    // Vehicle documents
    listVehicleDocuments: builder.query<PaginatedResponse<any>, void>({
      query: () => `/fleet/vehicle-documents/?expand=vehicle&include=vehicle`,
      providesTags: ['VehicleDocuments'],
    }),
    createVehicleDocument: builder.mutation<any, FormData>({
      query: (body) => ({ 
        url: `/fleet/vehicle-documents/`, 
        method: 'POST', 
        body,
        formData: true
      }),
      invalidatesTags: ['VehicleDocuments'],
    }),
    getVehicleDocumentById: builder.query<any, string>({
      query: (id) => `/fleet/vehicle-documents/${id}/`,
      providesTags: ['VehicleDocuments'],
    }),
    updateVehicleDocument: builder.mutation<any, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ 
        url: `/fleet/vehicle-documents/${id}/`, 
        method: 'PATCH', 
        body,
        formData: true
      }),
      invalidatesTags: ['VehicleDocuments'],
    }),
    deleteVehicleDocument: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/vehicle-documents/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['VehicleDocuments'],
    }),
    bulkDeleteVehicleDocuments: builder.mutation<any, { ids: string[] }>({
      query: ({ ids }) => ({ 
        url: `/fleet/vehicle-documents/bulk_delete/`, 
        method: 'POST', 
        body: { ids }
      }),
      invalidatesTags: ['VehicleDocuments'],
    }),

    // Fleet operators
    listFleetOperators: builder.query<PaginatedResponse<any>, void>({
      query: () => `/fleet/fleet-operators/`,
      providesTags: ['FleetOperators'],
    }),

    // Vehicle types
    listVehicleTypes: builder.query<PaginatedResponse<any>, void>({
      query: () => `/fleet/vehicle-types/`,
      providesTags: ['VehicleTypes'],
    }),
    getVehicleTypeById: builder.query<any, string>({
      query: (id) => `/fleet/vehicle-types/${id}/`,
      providesTags: ['VehicleTypes'],
    }),
    createVehicleType: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/vehicle-types/`, method: 'POST', body }),
      invalidatesTags: ['VehicleTypes'],
    }),
    updateVehicleType: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/vehicle-types/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['VehicleTypes'],
    }),
    deleteVehicleType: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/vehicle-types/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['VehicleTypes'],
    }),
    uploadVehicleTypesCSV: builder.mutation<any, FormData>({
      query: (formData) => ({ 
        url: `/fleet/vehicle-types/upload-csv/`, 
        method: 'POST', 
        body: formData,
        formData: true
      }),
      invalidatesTags: ['VehicleTypes'],
    }),

    // Dashcams - Added missing parameters from postman collection
    listDashcams: builder.query<PaginatedResponse<any>, { page?: number; search?: string; vehicle_id?: string }>({
      query: ({ page, search, vehicle_id }) => {
        const params = new URLSearchParams();
        if (page !== undefined) params.set('page', String(page));
        if (search !== undefined) params.set('search', search);
        if (vehicle_id !== undefined) params.set('vehicle_id', vehicle_id);
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
    refreshDashcamApiKey: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/dashcams/${id}/refresh_api_key/`, method: 'POST' }),
      invalidatesTags: ['Dashcams'],
    }),
    bulkRefreshDashcamApiKeys: builder.mutation<any, { selected_records: string[] }>({
      query: (body) => ({ url: `/fleet/dashcams/bulk_refresh_api_key/`, method: 'POST', body }),
      invalidatesTags: ['Dashcams'],
    }),

    // Video Segments endpoints
    listVideoSegments: builder.query<PaginatedResponse<any>, { 
      page?: number; 
      vehicle?: string; 
      dashcam?: string; 
      uploaded_after?: string; 
      uploaded_before?: string; 
      start_date?: string; 
      end_date?: string; 
      search?: string; 
    }>({
      query: (params) => ({
        url: `/fleet/video-segments/`,
        params: {
          page: params.page || 1,
          ...params
        }
      }),
      providesTags: ['VideoSegments'],
    }),

    // Maintenance - Added missing endpoints from postman collection
    listScheduledMaintenance: builder.query<PaginatedResponse<any>, { page?: number; status?: string }>({
      query: ({ page, status }) => {
        const params = new URLSearchParams();
        if (page !== undefined) params.set('page', String(page));
        if (status !== undefined) params.set('status', status);
        return `/fleet/scheduled-maintenance/?${params.toString()}`;
      },
      providesTags: ['Maintenance'],
    }),
    listMaintenanceRecords: builder.query<PaginatedResponse<any>, { vehicle?: string; status?: string; start_date?: string; end_date?: string; page?: number }>({
      query: ({ vehicle, status, start_date, end_date, page }) => {
        const params = new URLSearchParams();
        if (vehicle !== undefined) params.set('vehicle', vehicle);
        if (status !== undefined) params.set('status', status);
        if (start_date !== undefined) params.set('start_date', start_date);
        if (end_date !== undefined) params.set('end_date', end_date);
        if (page !== undefined) params.set('page', String(page));
        return `/fleet/maintenance-records/?${params.toString()}`;
      },
      providesTags: ['Maintenance'],
    }),
    getMaintenanceRecordsOverviewMetrics: builder.query<any, void>({
      query: () => `/fleet/maintenance-records/overview_metrics/`,
      providesTags: ['Maintenance'],
    }),
    getMaintenanceRecordById: builder.query<any, string>({
      query: (id) => `/fleet/maintenance-records/${id}/`,
      providesTags: ['Maintenance'],
    }),
    createMaintenanceRecord: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/maintenance-records/`, method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    updateMaintenanceRecord: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/maintenance-records/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Maintenance'],
    }),
    deleteMaintenanceRecord: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/maintenance-records/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Maintenance'],
    }),
    scheduleMaintenanceRecord: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/maintenance-records/${id}/schedule/`, method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    startMaintenanceRecord: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/maintenance-records/${id}/start/`, method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    completeMaintenanceRecord: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/maintenance-records/${id}/complete/`, method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    cancelMaintenanceRecord: builder.mutation<any, { id: string; body?: any }>({
      query: ({ id, body }) => ({ url: `/fleet/maintenance-records/${id}/cancel/`, method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    createScheduledMaintenance: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/scheduled-maintenance/`, method: 'POST', body }),
      invalidatesTags: ['Maintenance'],
    }),
    getScheduledMaintenanceById: builder.query<any, string>({
      query: (id) => `/fleet/scheduled-maintenance/${id}/`,
      providesTags: ['Maintenance'],
    }),
    updateScheduledMaintenance: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/scheduled-maintenance/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Maintenance'],
    }),
    deleteScheduledMaintenance: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/scheduled-maintenance/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Maintenance'],
    }),
    markServiceDone: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/scheduled-maintenance/${id}/mark_done/`, method: 'POST' }),
      invalidatesTags: ['Maintenance'],
    }),

    // OBD Devices
    listObdDevices: builder.query<PaginatedResponse<any>, { page?: number; status?: string }>({
      query: ({ page, status }) => {
        const params = new URLSearchParams();
        if (page !== undefined) params.set('page', String(page));
        if (status !== undefined) params.set('status', status);
        return `/fleet/obd-devices/?${params.toString()}`;
      },
      providesTags: ['OBDDevices'],
    }),
    createObdDevice: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/obd-devices/`, method: 'POST', body }),
      invalidatesTags: ['OBDDevices'],
    }),
    getObdDeviceById: builder.query<any, string>({
      query: (id) => `/fleet/obd-devices/${id}/`,
      providesTags: ['OBDDevices'],
    }),
    updateObdDevice: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/obd-devices/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['OBDDevices'],
    }),
    deleteObdDevice: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/obd-devices/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['OBDDevices'],
    }),

    // SIM Cards endpoints - Added missing parameters and endpoints from postman collection
    getSimCards: builder.query<any, { status?: string; plan?: string; device?: string; page?: number }>({
      query: ({ status, plan, device, page }) => {
        const params = new URLSearchParams();
        if (status !== undefined) params.set('status', status);
        if (plan !== undefined) params.set('plan', plan);
        if (device !== undefined) params.set('device', device);
        if (page !== undefined) params.set('page', String(page));
        return `/fleet/sim-cards/?${params.toString()}`;
      },
      providesTags: ['SimCards'],
    }),
    createSimCard: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/sim-cards/`, method: 'POST', body }),
      invalidatesTags: ['SimCards'],
    }),
    getSimCardById: builder.query<any, string>({
      query: (id) => `/fleet/sim-cards/${id}/`,
      providesTags: ['SimCards'],
    }),
    updateSimCard: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/sim-cards/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['SimCards'],
    }),
    deleteSimCard: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/sim-cards/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['SimCards'],
    }),
    activateSimCard: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/sim-cards/${id}/activate/`, method: 'POST' }),
      invalidatesTags: ['SimCards'],
    }),
    deactivateSimCard: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/sim-cards/${id}/deactivate/`, method: 'POST' }),
      invalidatesTags: ['SimCards'],
    }),
    suspendSimCard: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/sim-cards/${id}/suspend/`, method: 'POST' }),
      invalidatesTags: ['SimCards'],
    }),
    updateSimCardUsage: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/sim-cards/${id}/update-usage/`, method: 'POST', body }),
      invalidatesTags: ['SimCards'],
    }),
    getSimCardsSummary: builder.query<any, void>({
      query: () => `/fleet/sim-cards/summary/`,
      providesTags: ['SimCards'],
    }),

    // Analytics endpoints - Added missing parameters from postman collection
    getAnalytics: builder.query<any, { start_date?: string; end_date?: string; vehicle_type?: string; vehicle?: string; driver?: string; metrics?: string[]; group_by?: string }>({
      query: ({ start_date, end_date, vehicle_type, vehicle, driver, metrics, group_by }) => {
        const params = new URLSearchParams();
        if (start_date !== undefined) params.set('start_date', start_date);
        if (end_date !== undefined) params.set('end_date', end_date);
        if (vehicle_type !== undefined) params.set('vehicle_type', vehicle_type);
        if (vehicle !== undefined) params.set('vehicle', vehicle);
        if (driver !== undefined) params.set('driver', driver);
        if (metrics !== undefined && metrics.length > 0) {
          metrics.forEach(metric => params.append('metrics', metric));
        }
        if (group_by !== undefined) params.set('group_by', group_by);
        return `/fleet/analytics/?${params.toString()}`;
      },
      providesTags: ['Analytics'],
    }),

    // Alert Rules endpoints
    getAlertRules: builder.query<any, void>({
      query: () => `/fleet/alert-rules/`,
      providesTags: ['AlertRules'],
    }),
    createAlertRule: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/alert-rules/`, method: 'POST', body }),
      invalidatesTags: ['AlertRules'],
    }),
    getAlertRuleById: builder.query<any, string>({
      query: (id) => `/fleet/alert-rules/${id}/`,
      providesTags: ['AlertRules'],
    }),
    updateAlertRule: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/alert-rules/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['AlertRules'],
    }),
    deleteAlertRule: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/alert-rules/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['AlertRules'],
    }),

    // Insurance endpoints
    getInsurancePolicies: builder.query<any, void>({
      query: () => `/fleet/insurance-policies/`,
      providesTags: ['Insurance'],
    }),
    createInsurancePolicy: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/insurance-policies/`, method: 'POST', body }),
      invalidatesTags: ['Insurance'],
    }),
    getInsurancePolicyById: builder.query<any, string>({
      query: (id) => `/fleet/insurance-policies/${id}/`,
      providesTags: ['Insurance'],
    }),
    updateInsurancePolicy: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/insurance-policies/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Insurance'],
    }),
    deleteInsurancePolicy: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/insurance-policies/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Insurance'],
    }),

    // Firmware Updates endpoints - Added missing endpoints from postman collection
    listFirmwareUpdates: builder.query<PaginatedResponse<any>, { component?: string; status?: string; version?: string; page?: number }>({
      query: ({ component, status, version, page }) => {
        const params = new URLSearchParams();
        if (component !== undefined) params.set('component', component);
        if (status !== undefined) params.set('status', status);
        if (version !== undefined) params.set('version', version);
        if (page !== undefined) params.set('page', String(page));
        return `/fleet/firmware-updates/?${params.toString()}`;
      },
      providesTags: ['Firmware'],
    }),
    createFirmwareUpdate: builder.mutation<any, FormData>({
      query: (formData) => ({ 
        url: `/fleet/firmware-updates/`, 
        method: 'POST', 
        body: formData,
        formData: true
      }),
      invalidatesTags: ['Firmware'],
    }),
    getFirmwareUpdateById: builder.query<any, string>({
      query: (id) => `/fleet/firmware-updates/${id}/`,
      providesTags: ['Firmware'],
    }),
    getFirmwareUpdateSummary: builder.query<any, string>({
      query: (id) => `/fleet/firmware-updates/${id}/summary/`,
      providesTags: ['Firmware'],
    }),
    updateFirmwareUpdate: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/firmware-updates/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Firmware'],
    }),
    deleteFirmwareUpdate: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/firmware-updates/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Firmware'],
    }),
    pauseFirmwareUpdate: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/firmware-updates/${id}/pause/`, method: 'POST' }),
      invalidatesTags: ['Firmware'],
    }),
    resumeFirmwareUpdate: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `/fleet/firmware-updates/${id}/resume/`, method: 'POST' }),
      invalidatesTags: ['Firmware'],
    }),

    // Performance endpoints - Added missing endpoints from postman collection
    listDriverPerformance: builder.query<PaginatedResponse<any>, { driver?: string; start_date?: string; end_date?: string; min_safety_score?: number; max_safety_score?: number; min_eco_score?: number; max_eco_score?: number; page?: number }>({
      query: ({ driver, start_date, end_date, min_safety_score, max_safety_score, min_eco_score, max_eco_score, page }) => {
        const params = new URLSearchParams();
        if (driver !== undefined) params.set('driver', driver);
        if (start_date !== undefined) params.set('start_date', start_date);
        if (end_date !== undefined) params.set('end_date', end_date);
        if (min_safety_score !== undefined) params.set('min_safety_score', String(min_safety_score));
        if (max_safety_score !== undefined) params.set('max_safety_score', String(max_safety_score));
        if (min_eco_score !== undefined) params.set('min_eco_score', String(min_eco_score));
        if (max_eco_score !== undefined) params.set('max_eco_score', String(max_eco_score));
        if (page !== undefined) params.set('page', String(page));
        return `/fleet/driver-performance/?${params.toString()}`;
      },
      providesTags: ['Performance'],
    }),
    getDriverPerformanceById: builder.query<any, string>({
      query: (id) => `/fleet/driver-performance/${id}/`,
      providesTags: ['Performance'],
    }),
    createDriverPerformance: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/driver-performance/`, method: 'POST', body }),
      invalidatesTags: ['Performance'],
    }),
    updateDriverPerformance: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/driver-performance/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Performance'],
    }),
    deleteDriverPerformance: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/driver-performance/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Performance'],
    }),
    listVehiclePerformance: builder.query<PaginatedResponse<any>, { vehicle?: string; start_date?: string; end_date?: string; min_battery_health?: number; max_downtime?: number; page?: number }>({
      query: ({ vehicle, start_date, end_date, min_battery_health, max_downtime, page }) => {
        const params = new URLSearchParams();
        if (vehicle !== undefined) params.set('vehicle', vehicle);
        if (start_date !== undefined) params.set('start_date', start_date);
        if (end_date !== undefined) params.set('end_date', end_date);
        if (min_battery_health !== undefined) params.set('min_battery_health', String(min_battery_health));
        if (max_downtime !== undefined) params.set('max_downtime', String(max_downtime));
        if (page !== undefined) params.set('page', String(page));
        return `/fleet/vehicle-performance/?${params.toString()}`;
      },
      providesTags: ['Performance'],
    }),
    getVehiclePerformanceById: builder.query<any, string>({
      query: (id) => `/fleet/vehicle-performance/${id}/`,
      providesTags: ['Performance'],
    }),
    createVehiclePerformance: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/vehicle-performance/`, method: 'POST', body }),
      invalidatesTags: ['Performance'],
    }),
    updateVehiclePerformance: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({ url: `/fleet/vehicle-performance/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Performance'],
    }),
    deleteVehiclePerformance: builder.mutation<any, string>({
      query: (id) => ({ url: `/fleet/vehicle-performance/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Performance'],
    }),

    // Fleet Settings endpoints - Added missing endpoints from postman collection
    getFleetSettings: builder.query<any, void>({
      query: () => `/fleet/fleet-settings/`,
      providesTags: ['FleetSettings'],
    }),
    updateFleetSettings: builder.mutation<any, any>({
      query: (body) => ({ url: `/fleet/fleet-settings/`, method: 'PATCH', body }),
      invalidatesTags: ['FleetSettings'],
    }),

    // Top Error Codes endpoint - Available in postman collection
    getTopErrorCodes: builder.query<any, { limit?: number; dateRange?: string }>({
      query: ({ limit = 10, dateRange = 'today' }) => ({
        url: `/fleet/obd-telemetry/`,
        params: {
          top_errors: true,
          limit,
          date_range: dateRange,
        },
      }),
      providesTags: ['Telemetry'],
    }),

    // Telemetry Aggregated - Available in postman collection
    getTelemetryAggregated: builder.query<any, { dateRange?: string; startDate?: string; endDate?: string }>({
      query: ({ dateRange = 'today', startDate, endDate }) => ({
        url: `/fleet/obd-telemetry/`,
        params: {
          aggregated: true,
          ...(startDate && endDate 
            ? { start_date: startDate, end_date: endDate }
            : { date_range: dateRange })
        }
      }),
      providesTags: ['Telemetry'],
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
  useGetScheduledMaintenanceDashboardStatsQuery,
  useListVideoSegmentsQuery,
  useGetActiveAlertsQuery,
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
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
  useGetObdTelemetryQuery,
  useListVehiclesQuery,
  useCreateVehicleMutation,
  useGetVehicleByIdQuery,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehicleTelemetryQuery,
  useGetVehicleHistoryQuery,
  useSetVehiclesForMaintenanceMutation,
  useRetireVehiclesMutation,
  useGetDriversQuery,
  useGetDriverByIdQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
  useGetDriverDocumentsQuery,
  useCreateDriverDocumentMutation,
  useGetDriverDocumentByIdQuery,
  useUpdateDriverDocumentMutation,
  useDeleteDriverDocumentMutation,
  useListVehicleDocumentsQuery,
  useCreateVehicleDocumentMutation,
  useGetVehicleDocumentByIdQuery,
  useUpdateVehicleDocumentMutation,
  useDeleteVehicleDocumentMutation,
  useBulkDeleteVehicleDocumentsMutation,
  useListFleetOperatorsQuery,
  useListVehicleTypesQuery,
  useGetVehicleTypeByIdQuery,
  useCreateVehicleTypeMutation,
  useUpdateVehicleTypeMutation,
  useDeleteVehicleTypeMutation,
  useUploadVehicleTypesCSVMutation,
  useListDashcamsQuery,
  useCreateDashcamMutation,
  useGetDashcamByIdQuery,
  useUpdateDashcamMutation,
  useDeleteDashcamMutation,
  useRefreshDashcamApiKeyMutation,
  useListScheduledMaintenanceQuery,
  useCreateScheduledMaintenanceMutation,
  useGetScheduledMaintenanceByIdQuery,
  useUpdateScheduledMaintenanceMutation,
  useDeleteScheduledMaintenanceMutation,
  useMarkServiceDoneMutation,
  useListObdDevicesQuery,
  useCreateObdDeviceMutation,
  useGetObdDeviceByIdQuery,
  useUpdateObdDeviceMutation,
  useDeleteObdDeviceMutation,
  useGetSimCardsQuery,
  useCreateSimCardMutation,
  useGetSimCardByIdQuery,
  useUpdateSimCardMutation,
  useDeleteSimCardMutation,
  useActivateSimCardMutation,
  useDeactivateSimCardMutation,
  useSuspendSimCardMutation,
  useUpdateSimCardUsageMutation,
  useGetSimCardsSummaryQuery,
  useGetAnalyticsQuery,
  useGetAlertRulesQuery,
  useCreateAlertRuleMutation,
  useGetAlertRuleByIdQuery,
  useUpdateAlertRuleMutation,
  useDeleteAlertRuleMutation,
  useGetInsurancePoliciesQuery,
  useCreateInsurancePolicyMutation,
  useGetInsurancePolicyByIdQuery,
  useUpdateInsurancePolicyMutation,
  useDeleteInsurancePolicyMutation,
  // New exports for added endpoints
  useBulkRefreshDashcamApiKeysMutation,
  useListMaintenanceRecordsQuery,
  useGetMaintenanceRecordsOverviewMetricsQuery,
  useGetMaintenanceRecordByIdQuery,
  useCreateMaintenanceRecordMutation,
  useUpdateMaintenanceRecordMutation,
  useDeleteMaintenanceRecordMutation,
  useScheduleMaintenanceRecordMutation,
  useStartMaintenanceRecordMutation,
  useCompleteMaintenanceRecordMutation,
  useCancelMaintenanceRecordMutation,
  useListFirmwareUpdatesQuery,
  useCreateFirmwareUpdateMutation,
  useGetFirmwareUpdateByIdQuery,
  useGetFirmwareUpdateSummaryQuery,
  useUpdateFirmwareUpdateMutation,
  useDeleteFirmwareUpdateMutation,
  usePauseFirmwareUpdateMutation,
  useResumeFirmwareUpdateMutation,
  useListDriverPerformanceQuery,
  useGetDriverPerformanceByIdQuery,
  useCreateDriverPerformanceMutation,
  useUpdateDriverPerformanceMutation,
  useDeleteDriverPerformanceMutation,
  useListVehiclePerformanceQuery,
  useGetVehiclePerformanceByIdQuery,
  useCreateVehiclePerformanceMutation,
  useUpdateVehiclePerformanceMutation,
  useDeleteVehiclePerformanceMutation,
  useGetFleetSettingsQuery,
  useUpdateFleetSettingsMutation,
  useGetTopErrorCodesQuery,
  useGetTelemetryAggregatedQuery,
} = fleetApi;
