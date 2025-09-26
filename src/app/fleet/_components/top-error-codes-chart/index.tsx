"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useGetTopErrorCodesQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TopErrorCodesChartProps {
  className?: string;
}

export function TopErrorCodesChart({ className }: TopErrorCodesChartProps) {
  const { summary, loading: dashboardLoading } = useDashboard();
  const { data: errorCodesData, isLoading: errorCodesLoading, error: errorCodesError } = useGetTopErrorCodesQuery({
    limit: 10,
    dateRange: 'today'
  });

  const loading = dashboardLoading || errorCodesLoading;

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


  // Use real API data if available, fallback to dashboard summary, then mock data
  const topErrorCodes = errorCodesData?.top_error_codes || errorCodesData?.results || summary?.top_error_codes || [
    { code: "P0301", description: "Cylinder 1 Misfire", count: 15 },
    { code: "P0171", description: "System Too Lean", count: 12 },
    { code: "P0420", description: "Catalyst Efficiency", count: 10 },
    { code: "P0442", description: "Evap System Leak", count: 8 },
    { code: "P0128", description: "Coolant Thermostat", count: 6 },
    { code: "P0300", description: "Random Misfire", count: 5 },
    { code: "P0174", description: "System Too Lean", count: 4 },
    { code: "P0455", description: "Large Evap Leak", count: 3 },
  ];

  const chartData = {
    series: [{
      name: "Error Count",
      data: topErrorCodes.map((error: any) => error.count),
    }],
    categories: topErrorCodes.map((error: any) => error.code),
    labels: topErrorCodes.map((error: any) => `${error.code}: ${error.description || 'No description'}`),
  };

  const chartOptions = {
    chart: {
      type: "bar" as const,
      height: 200,
      toolbar: { show: false },
    },
    colors: ["#EF4444"], // Red color for errors
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 600,
        },
        rotate: -45,
      },
    },
    yaxis: {
      title: {
        text: "Count",
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
      enabled: true,
      formatter: function(val: number) {
        return val.toString();
      },
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: ["#FFFFFF"],
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
        borderRadiusApplication: "end" as const,
        borderRadiusWhenStacked: "last" as const,
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value: number, { dataPointIndex }: any) {
          const error = topErrorCodes[dataPointIndex];
          return `${value} vehicles - ${error.description || error.code}`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250,
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

  const totalErrors = topErrorCodes.reduce((sum: number, error: any) => sum + error.count, 0);

  // Show error state if API fails and no fallback data
  if (errorCodesError && !summary?.top_error_codes) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
            Top Error Codes
          </h4>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load error codes data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
          Top Error Codes
        </h4>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total: {totalErrors} errors
        </div>
      </div>
      
      <div className="mb-4">
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="bar"
          height={200}
        />
      </div>
      
      {/* Error Codes Legend */}
      <div className="text-left">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
          Error Descriptions:
        </div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          {topErrorCodes.slice(0, 4).map((error: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">{error.code}:</span> {error.description || 'No description available'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
