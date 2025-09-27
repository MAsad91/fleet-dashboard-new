"use client";

import { useGetTelemetryAggregatedQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, TrendingDown, Zap, Gauge, Thermometer, Battery } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TelemetryAggregatedProps {
  className?: string;
}

export function TelemetryAggregated({ className }: TelemetryAggregatedProps) {
  const { data: aggregatedData, isLoading, error } = useGetTelemetryAggregatedQuery({
    dateRange: '1month'
  });


  if (isLoading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Show "No data" if no telemetry data is available
  if (!aggregatedData) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Telemetry Aggregated
          </h3>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Telemetry aggregated data is not available</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Telemetry Aggregated
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load telemetry data
          </p>
        </div>
      </div>
    );
  }


  const chartData = {
    series: [{
      name: "Performance Metrics",
      data: [
        aggregatedData?.average_speed_kph || 0,
        aggregatedData?.average_battery_level || 0,
        aggregatedData?.average_motor_temp_c || 0,
        (aggregatedData?.average_efficiency_km_per_kwh || 0) * 10, // Scale for visualization
        aggregatedData?.data_quality_score || 0
      ]
    }],
    categories: ["Speed", "Battery", "Temp", "Efficiency", "Quality"]
  };

  const chartOptions = {
    chart: {
      type: "radar" as const,
      height: 300,
      toolbar: { show: false },
    },
    colors: ["#3b82f6"],
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: true,
      strokeDashArray: 3,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#e5e7eb',
          fill: {
            colors: ['#f8fafc']
          }
        }
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value: number, { seriesIndex, dataPointIndex }: any) {
          const labels = ["km/h", "%", "°C", "km/kWh", "%"];
          return `${value.toFixed(1)} ${labels[dataPointIndex]}`;
        },
      },
    },
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-title-sm font-semibold text-dark dark:text-white">
          Telemetry Aggregated
        </h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Data Points</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {aggregatedData?.total_data_points?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Gauge className="h-3 w-3 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Avg Speed</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {aggregatedData?.average_speed_kph?.toFixed(1) || '0.0'} km/h
            </span>
            {getTrendIcon(aggregatedData?.performance_trend)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Battery className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Battery Level</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {aggregatedData?.average_battery_level?.toFixed(1) || '0.0'}%
            </span>
            {getTrendIcon(aggregatedData?.battery_trend)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Thermometer className="h-3 w-3 text-red-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Motor Temp</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {aggregatedData?.average_motor_temp_c?.toFixed(1) || '0.0'}°C
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3 text-purple-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Efficiency</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {aggregatedData?.average_efficiency_km_per_kwh?.toFixed(1) || '0.0'} km/kWh
            </span>
            {getTrendIcon(aggregatedData?.efficiency_trend)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-indigo-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Data Quality</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {aggregatedData?.data_quality_score?.toFixed(1) || '0.0'}%
            </span>
          </div>
        </div>
      </div>

      {/* Performance Radar Chart */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-2">
          Performance Overview
        </h4>
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="radar"
          height={300}
        />
      </div>

      {/* Energy Summary */}
      <div>
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-2">
          Energy Summary
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Total Energy Consumed</span>
            <span className="font-medium text-dark dark:text-white">
              {aggregatedData?.total_energy_consumed_kwh?.toFixed(1) || '0.0'} kWh
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Vehicles Reporting</span>
            <span className="font-medium text-dark dark:text-white">
              {aggregatedData?.vehicles_reporting || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Data Quality</span>
            <span className={`font-medium ${
              (aggregatedData?.data_quality_score || 0) >= 90 
                ? 'text-green-600' 
                : (aggregatedData?.data_quality_score || 0) >= 70 
                ? 'text-yellow-600' 
                : 'text-red-600'
            }`}>
              {(aggregatedData?.data_quality_score || 0).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
