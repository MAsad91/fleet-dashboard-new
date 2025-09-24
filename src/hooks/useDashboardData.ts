import { apiClient } from '@/lib/api-client';
import { useState, useEffect, useCallback, useRef } from 'react';

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
  energy_metrics?: {
    total_energy_consumed_kwh: number;
    average_efficiency_km_per_kwh: number;
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
  most_active_vehicle: {
    id: number;
    license_plate: string;
    total_distance_km: number;
  };
  top_error_codes?: Array<{
    code: string;
    description: string;
    count: number;
  }>;
}

export interface DashboardStats {
  vehicles: any;
  drivers: any;
  trips: any;
  alerts: any;
  maintenance: any;
}

export interface UseDashboardDataReturn {
  summary: DashboardSummary | null;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateDateRange: (dateRange: string, startDate?: string, endDate?: string) => Promise<void>;
}

export function useDashboardData(
  initialDateRange: string = 'today',
  initialStartDate?: string,
  initialEndDate?: string
): UseDashboardDataReturn {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel with timeout and error handling
      const [
        summaryData,
        vehiclesStats,
        driversStats,
        tripsStats,
        alertsStats,
        maintenanceStats
      ] = await Promise.allSettled([
        apiClient.getDashboardSummary(dateRange, startDate, endDate),
        apiClient.getVehiclesStats(dateRange, startDate, endDate),
        apiClient.getDriversStats(dateRange, startDate, endDate),
        apiClient.getTripsStats(dateRange, startDate, endDate),
        apiClient.getAlertsStats(dateRange, startDate, endDate),
        apiClient.getMaintenanceStats(dateRange, startDate, endDate),
      ]);

      // Handle successful responses
      const summary = summaryData.status === 'fulfilled' ? summaryData.value : null;
      const vehicles = vehiclesStats.status === 'fulfilled' ? vehiclesStats.value : null;
      const drivers = driversStats.status === 'fulfilled' ? driversStats.value : null;
      const trips = tripsStats.status === 'fulfilled' ? tripsStats.value : null;
      const alerts = alertsStats.status === 'fulfilled' ? alertsStats.value : null;
      const maintenance = maintenanceStats.status === 'fulfilled' ? maintenanceStats.value : null;


      // Log any failed requests with detailed error info
      const failedRequests = [];
      if (summaryData.status === 'rejected') {
        console.error('❌ Summary API failed:', summaryData.reason);
        failedRequests.push('Summary');
      }
      if (vehiclesStats.status === 'rejected') {
        console.error('❌ Vehicles Stats API failed:', vehiclesStats.reason);
        failedRequests.push('Vehicles Stats');
      }
      if (driversStats.status === 'rejected') {
        console.error('❌ Drivers Stats API failed:', driversStats.reason);
        failedRequests.push('Drivers Stats');
      }
      if (tripsStats.status === 'rejected') {
        console.error('❌ Trips Stats API failed:', tripsStats.reason);
        failedRequests.push('Trips Stats');
      }
      if (alertsStats.status === 'rejected') {
        console.error('❌ Alerts Stats API failed:', alertsStats.reason);
        failedRequests.push('Alerts Stats');
      }
      if (maintenanceStats.status === 'rejected') {
        console.error('❌ Maintenance Stats API failed:', maintenanceStats.reason);
        failedRequests.push('Maintenance Stats');
      }

      if (failedRequests.length > 0) {
        console.warn(`⚠️ Dashboard: Some data failed to load: ${failedRequests.join(', ')}`);
      }

      setSummary(summary);
      setStats({
        vehicles,
        drivers,
        trips,
        alerts,
        maintenance,
      });
    } catch (err: any) {
      console.error('💥 Dashboard: Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, startDate, endDate]);

  const updateDateRange = useCallback(async (
    newDateRange: string, 
    newStartDate?: string, 
    newEndDate?: string
  ) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new values immediately for UI responsiveness
    setDateRange(newDateRange);
    setStartDate(newStartDate);
    setEndDate(newEndDate);

    // Debounce the API call to prevent excessive requests
    debounceTimeoutRef.current = setTimeout(() => {
      fetchDashboardData();
    }, 300); // 300ms debounce
  }, [fetchDashboardData]);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    summary,
    stats,
    loading,
    error,
    refetch,
    updateDateRange,
  };
}
