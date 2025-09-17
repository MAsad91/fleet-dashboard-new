"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type PropsType = {
  className?: string;
};

export function FuelConsumptionChart({ className }: PropsType) {
  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#18BFFF", "#3FD97F"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Fuel Consumption (Gallons)",
      },
      labels: {
        formatter: (value: number) => `${value}G`,
      },
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
        formatter: (value: number) => `${value} Gallons`,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Fuel Used",
      data: [1200, 1350, 1100, 1400, 1300, 1500, 1600, 1450, 1200, 1300, 1400, 1500],
    },
    {
      name: "Fuel Budget",
      data: [1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300],
    },
  ];

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <h3 className="text-title-sm font-semibold text-dark dark:text-white">
          Fuel Consumption Analytics
        </h3>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Monthly fuel usage vs budget comparison
        </p>
      </div>

      <Chart
        options={chartOptions}
        series={series}
        type="area"
        height={350}
        width="100%"
      />

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-dark dark:text-white">
              Total Used
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            15,600G
          </p>
        </div>
        
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-dark dark:text-white">
              Budget
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            15,600G
          </p>
        </div>
      </div>
    </div>
  );
}
