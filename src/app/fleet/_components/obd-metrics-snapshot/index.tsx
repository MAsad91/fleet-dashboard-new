"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

interface OBDMetricsSnapshotProps {
  className?: string;
}

export function OBDMetricsSnapshot({ className }: OBDMetricsSnapshotProps) {
  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const obdMetrics = summary?.obd_metrics;
  
  // Show "No data" if no real data is available
  if (!obdMetrics) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <h3 className="text-title-sm font-semibold text-dark dark:text-white mb-4">
          OBD Metrics Snapshot
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">OBD metrics data is not available</p>
        </div>
      </div>
    );
  }

  // Ensure all values are numbers, not null/undefined
  const safeObdMetrics = {
    average_speed_kph: obdMetrics.average_speed_kph ?? 0,
    average_motor_temp_c: obdMetrics.average_motor_temp_c ?? 0,
    average_estimated_range_km: obdMetrics.average_estimated_range_km ?? 0,
    average_battery_voltage: obdMetrics.average_battery_voltage ?? 0,
    average_tire_pressure_kpa: obdMetrics.average_tire_pressure_kpa ?? 0,
    vehicles_reporting_errors: obdMetrics.vehicles_reporting_errors ?? 0,
  };

  const metrics = [
    {
      label: "Avg Speed",
      value: safeObdMetrics.average_speed_kph,
      unit: "kph",
      icon: "🚗",
    },
    {
      label: "Avg Motor Temp",
      value: safeObdMetrics.average_motor_temp_c,
      unit: "°C",
      icon: "🌡️",
    },
    {
      label: "Avg Range",
      value: safeObdMetrics.average_estimated_range_km,
      unit: "km",
      icon: "🔋",
    },
    {
      label: "Avg Voltage",
      value: safeObdMetrics.average_battery_voltage,
      unit: "V",
      icon: "⚡",
    },
    {
      label: "Avg Tire Pressure",
      value: safeObdMetrics.average_tire_pressure_kpa,
      unit: "kPa",
      icon: "🛞",
    },
    {
      label: "Vehicles with Errors",
      value: safeObdMetrics.vehicles_reporting_errors,
      unit: "",
      icon: "⚠️",
      isError: true,
    },
  ];

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <h3 className="text-title-sm font-semibold text-dark dark:text-white mb-4">
        OBD Metrics Snapshot
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={cn(
              "text-center p-3 rounded-lg border",
              metric.isError && metric.value > 0
                ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
            )}
          >
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="text-sm font-medium text-body-color dark:text-body-color-dark mb-1">
              {metric.label}
            </div>
            <div
              className={cn(
                "text-lg font-bold",
                metric.isError && metric.value > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-dark dark:text-white"
              )}
            >
              {typeof metric.value === 'number' ? metric.value.toFixed(1) : '0.0'}
              {metric.unit && <span className="text-xs ml-1">{metric.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
