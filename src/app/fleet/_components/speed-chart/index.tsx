"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useGetObdTelemetryQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { TrendingUp } from "lucide-react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SpeedChartProps {
  className?: string;
}

export function SpeedChart({ className }: SpeedChartProps) {
  const { summary, loading: dashboardLoading } = useDashboard();
  const { data: telemetryApiData, isLoading: telemetryLoading, error: telemetryError } = useGetObdTelemetryQuery({
    date_range: '30days',
  });

  const loading = dashboardLoading || telemetryLoading;

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Process real telemetry data if available
  const generateTimeSeriesData = () => {
    if (telemetryApiData?.results && telemetryApiData.results.length > 0) {
      // Group telemetry data by date and calculate daily average speeds
      const dailyData = new Map();
      
      telemetryApiData.results.forEach((point: any) => {
        const date = new Date(point.timestamp).toDateString();
        if (!dailyData.has(date)) {
          dailyData.set(date, { speed: 0, count: 0 });
        }
        dailyData.get(date).speed += point.speed_kph || 0;
        dailyData.get(date).count += 1;
      });

      const days = [];
      const speedData = [];
      
      // Generate last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const dayData = dailyData.get(dateStr);
        speedData.push(dayData ? Math.round(dayData.speed / dayData.count) : 0);
      }
      
      return { days, speedData };
    } else {
      // No data available
      return { days: [], speedData: [] };
    }
  };

  const { days, speedData } = generateTimeSeriesData();

  // Show "No data" if no telemetry data is available
  if (!telemetryApiData?.results || telemetryApiData.results.length === 0) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Speed Trends
          </h3>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Speed data is not available</p>
        </div>
      </div>
    );
  }

  // Show error state if API fails
  if (telemetryError) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Speed Trends
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load speed data
          </p>
        </div>
      </div>
    );
  }

  const chartOptions = {
    chart: {
      type: "line" as const,
      height: 250,
      toolbar: { show: false },
    },
    colors: ["#10B981"], // Green for speed
    xaxis: {
      categories: days,
      labels: {
        style: {
          fontSize: "11px",
        },
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: "Speed (km/h)",
        style: {
          fontSize: "12px",
        },
      },
      labels: {
        style: {
          fontSize: "11px",
        },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      borderColor: "#E5E7EB",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value: number) {
          return value + " km/h";
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 200,
          },
          xaxis: {
            labels: {
              rotate: -90,
              style: {
                fontSize: "10px",
              },
            },
          },
        },
      },
    ],
  };

  const avgSpeed = (speedData.reduce((sum, val) => sum + val, 0) / speedData.length).toFixed(1);

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
          Average Speed Trend
        </h4>
        <div className="text-sm font-semibold text-green-600">
          Avg: {avgSpeed} km/h
        </div>
      </div>
      
      <Chart
        options={chartOptions}
        series={[{ name: "Speed", data: speedData }]}
        type="line"
        height={250}
      />
    </div>
  );
}
