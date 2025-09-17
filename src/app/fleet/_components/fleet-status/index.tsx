"use client";

import { useGetDashboardSummaryQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { TruckIcon } from "@/components/Layouts/sidebar/icons";

type PropsType = {
  className?: string;
};

export function FleetStatus({ className }: PropsType) {
  const { data: summary, isLoading: loading } = useGetDashboardSummaryQuery('today');

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusData = summary?.vehicle_status_breakdown || {
    available: 0,
    in_use: 0,
    maintenance: 0,
  };

  const totalFleet = statusData.available + statusData.in_use + statusData.maintenance;

  const fleetData = [
    { 
      status: "Available", 
      count: statusData.available, 
      total: totalFleet, 
      color: "bg-green-500", 
      textColor: "text-green-600 dark:text-green-400" 
    },
    { 
      status: "In Use", 
      count: statusData.in_use, 
      total: totalFleet, 
      color: "bg-blue-500", 
      textColor: "text-blue-600 dark:text-blue-400" 
    },
    { 
      status: "Maintenance", 
      count: statusData.maintenance, 
      total: totalFleet, 
      color: "bg-orange-500", 
      textColor: "text-orange-600 dark:text-orange-400" 
    },
  ];

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <h3 className="text-title-sm font-semibold text-dark dark:text-white">
          Fleet Status
        </h3>
      </div>

      <div className="space-y-4">
        {fleetData.map((item, index) => {
          const percentage = (item.count / item.total) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-dark dark:text-white">
                    {item.status}
                  </span>
                </div>
                <span className="text-sm text-body-color dark:text-body-color-dark">
                  {item.count} vehicles
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full transition-all duration-300", item.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Total Fleet */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4 text-dark dark:text-white" />
              <span className="text-sm font-medium text-dark dark:text-white">
                Total Fleet
              </span>
            </div>
            <span className="text-sm font-medium text-dark dark:text-white">
              {totalFleet} vehicles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
