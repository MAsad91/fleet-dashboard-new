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

  const diagnostics = summary?.diagnostics || {
    device_health: { critical: 0, warning: 0, normal: 0, total: 0 },
  };

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
