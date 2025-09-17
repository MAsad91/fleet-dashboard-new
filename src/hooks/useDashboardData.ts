import { apiClient } from '@/lib/api-client';
import { useState, useEffect, useCallback } from 'react';

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
  most_active_vehicle: {
    id: number;
    license_plate: string;
    total_distance_km: number;
  };
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        summaryData,
        vehiclesStats,
        driversStats,
        tripsStats,
        alertsStats,
        maintenanceStats
      ] = await Promise.all([
        apiClient.getDashboardSummary(dateRange, startDate, endDate),
        apiClient.getVehiclesStats(dateRange, startDate, endDate),
        apiClient.getDriversStats(dateRange, startDate, endDate),
        apiClient.getTripsStats(dateRange, startDate, endDate),
        apiClient.getAlertsStats(dateRange, startDate, endDate),
        apiClient.getMaintenanceStats(dateRange, startDate, endDate),
      ]);

      setSummary(summaryData);
      setStats({
        vehicles: vehiclesStats,
        drivers: driversStats,
        trips: tripsStats,
        alerts: alertsStats,
        maintenance: maintenanceStats,
      });
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
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
    setDateRange(newDateRange);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    summary,
    stats,
    loading,
    error,
    refetch,
    updateDateRange,
  };
}
