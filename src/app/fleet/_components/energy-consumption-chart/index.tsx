"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface EnergyConsumptionChartProps {
  className?: string;
}

export function EnergyConsumptionChart({ className }: EnergyConsumptionChartProps) {
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

  // Use mock data for energy consumption chart (API doesn't provide this data yet)
  const energyData = {
    series: [
      {
        name: "Energy Consumption",
        data: [12, 8, 15, 22, 18, 25, 30, 28, 35, 32, 28, 25, 20, 18, 22, 28, 32, 35, 30, 25, 20, 15, 12, 10]
      }
    ],
    categories: Array.from({ length: 24 }, (_, i) => `${i}:00`)
  };

  const options = {
    chart: {
      type: "line" as const,
      height: 300,
      toolbar: { show: false },
    },
    colors: ["#3b82f6"],
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    xaxis: {
      categories: energyData.categories,
      labels: {
        style: {
          colors: "#64748b",
        },
      },
    },
    yaxis: {
      title: {
        text: "kWh",
        style: {
          color: "#64748b",
        },
      },
      labels: {
        style: {
          colors: "#64748b",
        },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      borderColor: "#e2e8f0",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: "dark",
    },
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <h3 className="text-title-sm font-semibold text-dark dark:text-white mb-2">
          Energy Consumption
        </h3>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Weekly energy usage and cost
        </p>
      </div>
      
      <Chart
        options={options}
        series={energyData.series}
        type="line"
        height={300}
      />
    </div>
  );
}
