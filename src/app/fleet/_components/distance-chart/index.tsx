"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DistanceChartProps {
  className?: string;
}

export function DistanceChart({ className }: DistanceChartProps) {
  const { summary, loading } = useDashboard();

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

  // Mock data for last 30 days - in real implementation, this would come from trips/telemetry API
  const generateTimeSeriesData = () => {
    const days = [];
    const distanceData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Mock data - in reality this would come from API
      distanceData.push(Math.floor(Math.random() * 500) + 200);
    }
    
    return { days, distanceData };
  };

  const { days, distanceData } = generateTimeSeriesData();

  const chartOptions = {
    chart: {
      type: "line" as const,
      height: 250,
      toolbar: { show: false },
    },
    colors: ["#3B82F6"], // Blue for distance
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
        text: "Distance (km)",
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
          return value + " km";
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

  const totalDistance = distanceData.reduce((sum, val) => sum + val, 0);

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark flex items-center">
          <Activity className="h-4 w-4 mr-2 text-blue-500" />
          Daily Distance Traveled
        </h4>
        <div className="text-sm font-semibold text-blue-600">
          Total: {totalDistance.toLocaleString()} km
        </div>
      </div>
      
      <Chart
        options={chartOptions}
        series={[{ name: "Distance", data: distanceData }]}
        type="line"
        height={250}
      />
    </div>
  );
}
