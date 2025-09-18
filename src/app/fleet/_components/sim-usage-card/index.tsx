"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SimUsageCardProps {
  className?: string;
}

export function SimUsageCard({ className }: SimUsageCardProps) {
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
    sim_cards: { high_usage: 0, inactive: 0, total: 0 },
  };

  const simUsageData = {
    series: [{
      data: [
        diagnostics.sim_cards.high_usage,
        diagnostics.sim_cards.inactive,
      ]
    }],
    labels: ["High Usage", "Inactive"],
  };

  // SIM Card Usage will use bar chart for better comparison visualization
  const chartType = 'bar';

  const donutOptions = {
    chart: {
      type: "donut" as const,
      height: 200,
    },
    colors: ["#3b82f6", "#6b7280"],
    labels: simUsageData.labels,
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
    colors: ["#3b82f6", "#6b7280"],
    xaxis: {
      categories: simUsageData.labels,
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
        SIM Card Usage
      </h4>
      
      <div className="text-center">
        <Chart
          options={barOptions}
          series={simUsageData.series}
          type="bar"
          height={200}
        />
        <div className="mt-2 text-xs text-body-color dark:text-body-color-dark">
          Total: {diagnostics.sim_cards.total} SIM cards
        </div>
      </div>
    </div>
  );
}
