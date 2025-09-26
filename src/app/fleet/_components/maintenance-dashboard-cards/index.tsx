"use client";

import { useGetScheduledMaintenanceDashboardStatsQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { WrenchIcon, ClockIcon, AlertIcon, ActivityIcon } from "@/components/Layouts/sidebar/icons";

interface MaintenanceDashboardCardsProps {
  className?: string;
  dateRange?: string;
}

export function MaintenanceDashboardCards({ className, dateRange = "1month" }: MaintenanceDashboardCardsProps) {
  const { 
    data: maintenanceStats, 
    isLoading, 
    error 
  } = useGetScheduledMaintenanceDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700", className)}>
        <div className="text-center py-8">
          <WrenchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load maintenance statistics
          </p>
        </div>
      </div>
    );
  }

  const stats = maintenanceStats || {
    total_records: 0,
    due_soon_records: 0,
    overdue_records: 0,
    completed_records: 0
  };

  const cards = [
    {
      title: "Total Records",
      value: stats.total_records,
      icon: WrenchIcon,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "All maintenance records"
    },
    {
      title: "Due Soon",
      value: stats.due_soon_records,
      icon: ClockIcon,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      description: "Maintenance due soon"
    },
    {
      title: "Overdue",
      value: stats.overdue_records,
      icon: AlertIcon,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      description: "Overdue maintenance"
    },
    {
      title: "Completed",
      value: stats.completed_records,
      icon: ActivityIcon,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Completed maintenance"
    }
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <IconComponent className={cn("h-6 w-6", card.color)} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {card.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
