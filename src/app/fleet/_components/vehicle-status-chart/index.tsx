"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type PropsType = {
  className?: string;
};

export function VehicleStatusChart({ className }: PropsType) {
  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 350,
    },
    labels: ["Active", "In Transit", "Maintenance", "Idle"],
    colors: ["#3FD97F", "#18BFFF", "#FF9C55", "#FF6B6B"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Vehicles",
              formatter: () => "156",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: string) => `${val}%`,
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

  const series = [89, 45, 23, 12]; // Active, In Transit, Maintenance, Idle

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <h3 className="text-title-sm font-semibold text-dark dark:text-white">
          Vehicle Status Distribution
        </h3>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Current status of all vehicles in your fleet
        </p>
      </div>

      <Chart
        options={chartOptions}
        series={series}
        type="donut"
        height={350}
        width="100%"
      />
    </div>
  );
}
