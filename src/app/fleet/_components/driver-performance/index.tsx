"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useGetDriversDashboardStatsQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { DriverIcon } from "@/components/Layouts/sidebar/icons";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type PropsType = {
  className?: string;
};

export function DriverPerformance({ className }: PropsType) {
  const { data: driversStatsData, isLoading, error } = useGetDriversDashboardStatsQuery({
    dateRange: '1month'
  });

  if (isLoading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center gap-2 mb-4">
          <DriverIcon className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Driver Performance
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load driver performance data
          </p>
        </div>
      </div>
    );
  }

  const driverData = driversStatsData?.top_performers || [];

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    colors: ["#3FD97F", "#18BFFF", "#FF9C55"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: driverData.map((driver: any) => driver.name),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Score",
      },
      max: 100,
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 3,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}%`,
      },
    },
  };

  const series = [
    {
      name: "Safety Score",
      data: driverData.map((driver: any) => driver.safety_score || driver.score),
    },
    {
      name: "Efficiency Score",
      data: driverData.map((driver: any) => driver.efficiency_score || driver.score),
    },
    {
      name: "Fuel Economy",
      data: driverData.map((driver: any) => driver.fuel_economy_score || driver.score),
    },
  ];

  // Use real API data for drivers list only
  const drivers = driversStatsData?.drivers || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "good":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "average":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DriverIcon className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Driver Performance
          </h3>
        </div>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Performance metrics for all drivers
        </p>
      </div>

      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={300}
        width="100%"
      />

      {/* Driver list */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium text-dark dark:text-white">
          Driver Summary
        </h4>
        {drivers.map((driver: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-dark dark:text-white">
                  {driver.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-dark dark:text-white">
                  {driver.name}
                </p>
                <p className="text-xs text-body-color dark:text-body-color-dark">
                  {driver.trips} trips • {driver.hours}h
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-dark dark:text-white">
                  {driver.rating}/5
                </p>
                <p className="text-xs text-body-color dark:text-body-color-dark">
                  Rating
                </p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                getStatusColor(driver.status)
              )}>
                {driver.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
