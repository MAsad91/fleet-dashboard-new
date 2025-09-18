"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BatteryHealthFleetChartProps {
  className?: string;
}

export function BatteryHealthFleetChart({ className }: BatteryHealthFleetChartProps) {
  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Use mock data for battery health chart (API doesn't provide this data yet)
  const batteryData = {
    series: [
      {
        name: "Current Capacity",
        data: [85, 92, 78, 88, 95]
      },
      {
        name: "Optimal Capacity",
        data: [100, 100, 100, 100, 100]
      }
    ],
    categories: ["EV-001", "EV-002", "EV-003", "EV-004", "EV-005"]
  };

  const options = {
    chart: {
      type: "bar" as const,
      height: 300,
      toolbar: { show: false },
    },
    colors: ["#10b981", "#3b82f6"],
    xaxis: {
      categories: batteryData.categories,
      labels: {
        style: {
          colors: "#64748b",
        },
      },
    },
    yaxis: {
      title: {
        text: "Percentage (%)",
        style: {
          color: "#64748b",
        },
      },
      labels: {
        style: {
          colors: "#64748b",
        },
      },
      min: 0,
      max: 100,
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      borderColor: "#e2e8f0",
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
    legend: {
      position: "top" as const,
      horizontalAlign: "left" as const,
    },
    tooltip: {
      theme: "dark",
    },
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <h3 className="text-title-sm font-semibold text-dark dark:text-white mb-2">
          Battery Health
        </h3>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Battery health and capacity across fleet
        </p>
      </div>
      
      <Chart
        options={options}
        series={batteryData.series}
        type="bar"
        height={300}
      />
    </div>
  );
}
