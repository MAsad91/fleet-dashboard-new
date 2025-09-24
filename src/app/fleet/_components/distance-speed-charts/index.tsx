"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { TrendingUp, Activity } from "lucide-react";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DistanceSpeedChartsProps {
  className?: string;
}

export function DistanceSpeedCharts({ className }: DistanceSpeedChartsProps) {
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
    const speedData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Mock data - in reality this would come from API
      distanceData.push(Math.floor(Math.random() * 500) + 200);
      speedData.push(Math.floor(Math.random() * 20) + 40);
    }
    
    return { days, distanceData, speedData };
  };

  const { days, distanceData, speedData } = generateTimeSeriesData();

  const distanceChartOptions = {
    chart: {
      type: "line" as const,
      height: 200,
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
            height: 150,
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

  const speedChartOptions = {
    chart: {
      type: "line" as const,
      height: 200,
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
            height: 150,
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
  const avgSpeed = (speedData.reduce((sum, val) => sum + val, 0) / speedData.length).toFixed(1);

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
          Distance & Speed Trends (Last 30 Days)
        </h4>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Distance</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Speed</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Distance Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Distance Traveled</span>
            </div>
            <div className="text-sm font-semibold text-blue-600">
              Total: {totalDistance.toLocaleString()} km
            </div>
          </div>
          <Chart
            options={distanceChartOptions}
            series={[{ name: "Distance", data: distanceData }]}
            type="line"
            height={200}
          />
        </div>

        {/* Speed Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Speed Trend</span>
            </div>
            <div className="text-sm font-semibold text-green-600">
              Avg: {avgSpeed} km/h
            </div>
          </div>
          <Chart
            options={speedChartOptions}
            series={[{ name: "Speed", data: speedData }]}
            type="line"
            height={200}
          />
        </div>
      </div>
    </div>
  );
}
