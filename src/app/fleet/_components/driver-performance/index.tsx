"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { DriverIcon } from "@/components/Layouts/sidebar/icons";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type PropsType = {
  className?: string;
};

export function DriverPerformance({ className }: PropsType) {
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
      categories: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Tom Brown"],
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
      data: [95, 88, 92, 85, 90],
    },
    {
      name: "Efficiency Score",
      data: [87, 92, 89, 88, 91],
    },
    {
      name: "Fuel Economy",
      data: [82, 90, 85, 87, 89],
    },
  ];

  // Mock driver data
  const drivers = [
    { name: "John Doe", trips: 45, hours: 180, rating: 4.8, status: "excellent" },
    { name: "Jane Smith", trips: 38, hours: 165, rating: 4.6, status: "good" },
    { name: "Mike Johnson", trips: 42, hours: 175, rating: 4.7, status: "excellent" },
    { name: "Sarah Wilson", trips: 35, hours: 150, rating: 4.4, status: "good" },
    { name: "Tom Brown", trips: 40, hours: 170, rating: 4.5, status: "good" },
  ];

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
        {drivers.map((driver, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-dark dark:text-white">
                  {driver.name.split(' ').map(n => n[0]).join('')}
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
