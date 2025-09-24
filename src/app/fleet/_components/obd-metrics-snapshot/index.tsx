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

  const obdMetrics = summary?.obd_metrics || {
    average_speed_kph: 54.2,
    average_motor_temp_c: 76.8,
    average_estimated_range_km: 312,
    average_battery_voltage: 48.7,
    average_tire_pressure_kpa: 225,
    vehicles_reporting_errors: 7,
  };

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
