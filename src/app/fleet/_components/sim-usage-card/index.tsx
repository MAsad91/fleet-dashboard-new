"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useGetSimCardsSummaryQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SimUsageCardProps {
  className?: string;
}

export function SimUsageCard({ className }: SimUsageCardProps) {
  const { summary, loading: dashboardLoading } = useDashboard();
  const { data: simCardsSummary, isLoading: simCardsLoading, error: simCardsError } = useGetSimCardsSummaryQuery();

  const loading = dashboardLoading || simCardsLoading;

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

  // Use dedicated SIM cards summary API data if available, otherwise fallback to dashboard data
  const diagnostics = summary?.diagnostics;
  const simCardsData = simCardsSummary || diagnostics?.sim_cards;
  
  // Debug logging to see what we're getting
  console.log('🔍 SIM Usage Card - Summary:', summary);
  console.log('🔍 SIM Usage Card - Diagnostics:', diagnostics);
  console.log('🔍 SIM Usage Card - SIM Cards Data:', simCardsData);
  console.log('🔍 SIM Usage Card - SIM Cards Summary:', simCardsSummary);
  console.log('🔍 SIM Usage Card - SIM Cards Summary Keys:', simCardsSummary ? Object.keys(simCardsSummary) : 'No data');
  
  // Always show the chart, even with zero data
  // This ensures we can see what's happening with the data
  
  // Handle different data structures from API
  let highUsage = 0;
  let inactive = 0;
  let active = 0;
  let total = 0;

  if (simCardsData) {
    // Check if it's the dashboard summary structure
    if (simCardsData.high_usage !== undefined && simCardsData.inactive !== undefined) {
      highUsage = simCardsData.high_usage || 0;
      inactive = simCardsData.inactive || 0;
      active = simCardsData.active || simCardsData.normal || simCardsData.low_usage || 0;
      total = simCardsData.total || simCardsData.count || 0;
      
      // If we have a total but no breakdown, calculate the missing category
      if (total > 0 && (highUsage + inactive + active) < total) {
        active = total - highUsage - inactive;
      }
    } else {
      // Check if it's a different structure - log the actual structure
      console.log('🔍 SIM Usage Card - Unexpected data structure:', simCardsData);
      console.log('🔍 SIM Usage Card - Available keys:', Object.keys(simCardsData));
      
      // Try to find the data in different possible structures
      if (simCardsData.results && Array.isArray(simCardsData.results)) {
        // Paginated response structure
        total = simCardsData.count || simCardsData.results.length || 0;
        // Calculate usage from results if available
        highUsage = simCardsData.results.filter((card: any) => card.usage_status === 'high_usage' || card.status === 'high_usage').length;
        inactive = simCardsData.results.filter((card: any) => card.usage_status === 'inactive' || card.status === 'inactive').length;
        active = simCardsData.results.filter((card: any) => 
          card.usage_status === 'active' || card.usage_status === 'normal' || card.usage_status === 'low_usage' ||
          card.status === 'active' || card.status === 'normal' || card.status === 'low_usage'
        ).length;
      } else {
        // Try to extract from any available structure
        total = simCardsData.total || simCardsData.count || 0;
        highUsage = simCardsData.high_usage || simCardsData.highUsage || 0;
        inactive = simCardsData.inactive || simCardsData.inactiveCount || 0;
        active = simCardsData.active || simCardsData.normal || simCardsData.low_usage || 0;
        
        // If we have a total but no breakdown, calculate the missing category
        if (total > 0 && (highUsage + inactive + active) < total) {
          active = total - highUsage - inactive;
        }
      }
    }
  }

  // Ensure pie chart displays properly even with zero values
  const adjustedHighUsage = highUsage === 0 && inactive === 0 && active === 0 ? 0.1 : highUsage;
  const adjustedInactive = inactive === 0 && highUsage === 0 && active === 0 ? 0.1 : inactive;
  const adjustedActive = active === 0 && highUsage === 0 && inactive === 0 ? 0.1 : active;

  const simUsageData = {
    series: [adjustedHighUsage, adjustedInactive, adjustedActive],
    labels: ["High Usage", "Inactive", "Active"],
  };

  // Donut chart works well with zero values, no adjustment needed

  // Debug logging
  console.log('🔍 SIM Usage Card - Data:', simCardsData);
  console.log('🔍 SIM Usage Card - High Usage:', highUsage);
  console.log('🔍 SIM Usage Card - Inactive:', inactive);
  console.log('🔍 SIM Usage Card - Active:', active);
  console.log('🔍 SIM Usage Card - Total:', total);
  console.log('🔍 SIM Usage Card - Series:', simUsageData.series);
  console.log('🔍 SIM Usage Card - Labels:', simUsageData.labels);
  console.log('🔍 SIM Usage Card - Has any data:', simUsageData.series.some(value => value > 0));

  // SIM Card Usage will use pie chart for better visualization

  const pieOptions = {
    chart: {
      type: "pie" as const,
      height: 200,
      toolbar: { show: false },
    },
    colors: ["#3b82f6", "#6b7280", "#10b981"],
    labels: simUsageData.labels,
    legend: {
      position: "bottom" as const,
      fontSize: "12px",
      fontWeight: 500,
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        dataLabels: {
          offset: 0,
          minAngleToShowLabel: 10,
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number, opts: any) {
        const seriesIndex = opts.seriesIndex;
        let actualValue = 0;
        if (seriesIndex === 0) actualValue = highUsage;
        else if (seriesIndex === 1) actualValue = inactive;
        else if (seriesIndex === 2) actualValue = active;
        return actualValue > 0 ? `${val.toFixed(1)}%` : '';
      },
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: ["#ffffff"],
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value: number, { seriesIndex }: any) {
          const label = simUsageData.labels[seriesIndex];
          let actualValue = 0;
          if (seriesIndex === 0) actualValue = highUsage;
          else if (seriesIndex === 1) actualValue = inactive;
          else if (seriesIndex === 2) actualValue = active;
          return `${actualValue} SIM cards (${label})`;
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


  // Show error state if both APIs fail
  if (simCardsError && !summary?.diagnostics) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
          SIM Card Usage
        </h4>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load SIM card data
          </p>
        </div>
      </div>
    );
  }

  // Show "No data" state if we have data but all values are zero
  const hasAnyData = simUsageData.series.some(value => value > 0);
  const totalSimCards = simCardsData.total || simCardsData.count || 0;
  
  if (!hasAnyData && totalSimCards === 0) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
          SIM Card Usage
        </h4>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
        SIM Card Usage
      </h4>
      
      <div className="text-center">
        <Chart
          options={pieOptions}
          series={simUsageData.series}
          type="pie"
          height={200}
        />
      </div>
    </div>
  );
}
