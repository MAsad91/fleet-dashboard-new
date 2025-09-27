"use client";

import { useGetDashcamsDashboardStatsQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { Camera, Video, HardDrive, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashcamAnalyticsProps {
  className?: string;
}

export function DashcamAnalytics({ className }: DashcamAnalyticsProps) {
  const { data: analyticsData, isLoading, error } = useGetDashcamsDashboardStatsQuery({
    dateRange: '1month'
  });


  if (isLoading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Show "No data" if no dashcam data is available
  if (!analyticsData) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Dashcam Analytics
          </h3>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400">Dashcam analytics data is not available</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Dashcam Analytics
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load dashcam data
          </p>
        </div>
      </div>
    );
  }


  const storagePercentage = analyticsData ? (analyticsData.storage_used_gb / analyticsData.storage_total_gb) * 100 : 0;

  const chartData = {
    series: [{
      name: "Storage Usage",
      data: [analyticsData?.storage_used_gb || 0]
    }],
    categories: ["Used Storage"]
  };

  const chartOptions = {
    chart: {
      type: "bar" as const,
      height: 200,
      toolbar: { show: false },
    },
    colors: ["#3b82f6"],
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      title: {
        text: "GB",
      },
      min: 0,
      max: analyticsData?.storage_total_gb || 100,
    },
    grid: {
      show: true,
      strokeDashArray: 3,
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return `${val.toFixed(1)} GB`;
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(value: number) {
          return `${value.toFixed(1)} GB (${analyticsData?.storage_total_gb ? ((value / analyticsData.storage_total_gb) * 100).toFixed(1) : '0'}%)`;
        },
      },
    },
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Camera className="h-5 w-5 text-primary" />
        <h3 className="text-title-sm font-semibold text-dark dark:text-white">
          Dashcam Analytics
        </h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Video className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Total Recordings</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {analyticsData?.total_recordings?.toLocaleString() || '0'}
            </span>
            {getTrendIcon(analyticsData?.recording_trend)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Storage Used</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {analyticsData?.storage_used_gb?.toFixed(1) || '0.0'} GB
            </span>
            {getTrendIcon(analyticsData?.storage_trend)}
          </div>
          <div className="text-xs text-gray-500">
            {storagePercentage.toFixed(1)}% of {analyticsData?.storage_total_gb || 100} GB
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Incident Detections</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {analyticsData?.incident_detections || 0}
            </span>
            {getTrendIcon(analyticsData?.incident_trend)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Camera className="h-3 w-3 text-purple-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Cameras Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-semibold text-dark dark:text-white">
              {analyticsData?.cameras_online || 0}/{analyticsData?.cameras_total || 0}
            </span>
            <span className="text-xs text-gray-500">
              ({analyticsData?.cameras_online && analyticsData?.cameras_total ? ((analyticsData.cameras_online / analyticsData.cameras_total) * 100).toFixed(0) : '0'}%)
            </span>
          </div>
        </div>
      </div>

      {/* Storage Usage Chart */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-2">
          Storage Usage
        </h4>
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="bar"
          height={200}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-2">
          Recent Activity
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Recording Hours Today</span>
            <span className="font-medium text-dark dark:text-white">
              {analyticsData?.recording_hours?.toFixed(1) || '0.0'}h
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Storage Available</span>
            <span className="font-medium text-dark dark:text-white">
              {analyticsData?.storage_total_gb && analyticsData?.storage_used_gb ? (analyticsData.storage_total_gb - analyticsData.storage_used_gb).toFixed(1) : '0.0'} GB
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Camera Health</span>
            <span className={`font-medium ${
              analyticsData?.cameras_online && analyticsData?.cameras_total
                ? (analyticsData.cameras_online / analyticsData.cameras_total) >= 0.9 
                  ? 'text-green-600' 
                  : (analyticsData.cameras_online / analyticsData.cameras_total) >= 0.7 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
                : 'text-gray-600'
            }`}>
              {analyticsData?.cameras_online && analyticsData?.cameras_total ? ((analyticsData.cameras_online / analyticsData.cameras_total) * 100).toFixed(0) : '0'}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
