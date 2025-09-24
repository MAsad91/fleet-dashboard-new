"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface VehicleStatusPieChartProps {
  className?: string;
}

export function VehicleStatusPieChart({ className }: VehicleStatusPieChartProps) {
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

  const vehicleStatusBreakdown = summary?.vehicle_status_breakdown || {
    available: 62,
    in_use: 48,
    maintenance: 18,
  };

  const chartData = {
    series: [
      vehicleStatusBreakdown.available || 0,
      vehicleStatusBreakdown.in_use || 0,
      vehicleStatusBreakdown.maintenance || 0,
    ],
    labels: ["Available", "In Use", "Maintenance"],
  };

  const totalVehicles = chartData.series.reduce((sum, value) => sum + value, 0);

  const chartOptions = {
    chart: {
      type: "pie" as const,
      height: 280,
    },
    colors: ["#10B981", "#3B82F6", "#F59E0B"], // Green, Blue, Orange
    labels: chartData.labels,
    legend: {
      position: "bottom" as const,
      fontSize: "12px",
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: "0%", // Regular pie chart, not donut
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: string, opts: any) {
        return opts.w.config.series[opts.seriesIndex] + " (" + val + "%)";
      },
      style: {
        fontSize: "12px",
        fontWeight: "600",
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value: number) {
          return value + " vehicles";
        },
      },
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

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
        Vehicle Status Distribution
      </h4>
      
      <div className="text-center">
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="pie"
          height={280}
        />
        <div className="mt-2 text-xs text-body-color dark:text-body-color-dark">
          Total: {totalVehicles} vehicles
        </div>
      </div>
    </div>
  );
}
