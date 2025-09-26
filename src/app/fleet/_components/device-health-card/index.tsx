"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DeviceHealthCardProps {
  className?: string;
}

export function DeviceHealthCard({ className }: DeviceHealthCardProps) {
  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
        </div>
      </div>
    );
  }

  const diagnostics = summary?.diagnostics;
  
  // Show "No data" if no real data is available
  if (!diagnostics || !diagnostics.device_health) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
          Device Health
        </h4>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Device health data is not available</p>
        </div>
      </div>
    );
  }

  const deviceHealthData = {
    series: [
      diagnostics.device_health.critical,
      diagnostics.device_health.warning,
      diagnostics.device_health.normal,
    ],
    labels: ["Critical", "Warning", "Normal"],
  };

  // Device Health will always use donut chart for better health status visualization
  const chartType = 'donut';

  const donutOptions = {
    chart: {
      type: "donut" as const,
      height: 200,
    },
    colors: ["#ef4444", "#f59e0b", "#10b981"],
    labels: deviceHealthData.labels,
    legend: {
      position: "bottom" as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const barOptions = {
    chart: {
      type: "bar" as const,
      height: 200,
      toolbar: { show: false },
    },
    colors: ["#ef4444", "#f59e0b", "#10b981"],
    xaxis: {
      categories: deviceHealthData.labels,
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
        Device Health
      </h4>
      
      <div className="text-center">
        <Chart
          options={donutOptions}
          series={deviceHealthData.series}
          type="donut"
          height={200}
        />
        <div className="mt-2 text-xs text-body-color dark:text-body-color-dark">
          Total: {diagnostics.device_health.total} devices
        </div>
      </div>
    </div>
  );
}
