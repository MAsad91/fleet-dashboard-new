"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useGetActiveAlertsQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { BellIcon } from "@/components/Layouts/sidebar/icons";

type PropsType = {
  className?: string;
};

export function RecentAlerts({ className }: PropsType) {
  const { summary, stats, loading } = useDashboard();
  
  // Try to get alerts from RTK Query as a fallback
  const { data: rtkAlertsData, isLoading: rtkLoading } = useGetActiveAlertsQuery({ 
    status: 'active', 
    limit: 5 
  });
  
  // Use real alerts data from the API only
  const alerts = stats?.alerts?.results || rtkAlertsData?.results || [];


  const getAlertIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('battery') || lowerTitle.includes('charge')) {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 2h6v8H5V5zm2 2v4h2V7H7z" />
        </svg>
      );
    } else if (lowerTitle.includes('maintenance') || lowerTitle.includes('service')) {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (lowerTitle.includes('temperature') || lowerTitle.includes('overheat')) {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    } else if (lowerTitle.includes('brake') || lowerTitle.includes('pressure')) {
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return <BellIcon className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (loading || rtkLoading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="mb-6">
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Recent Alerts
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <h3 className="text-title-sm font-semibold text-dark dark:text-white">
          Recent Alerts
        </h3>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {alerts.length > 0 ? (
          alerts.map((alert: any) => (
            <div
              key={alert.id}
              className="flex items-start gap-3"
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                getSeverityColor(alert.severity)
              )}>
                {getAlertIcon(alert.title)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-dark dark:text-white">
                  <span className="font-medium">{alert.vehicle}:</span>{" "}
                  <span className="text-body-color dark:text-body-color-dark">
                    {alert.title}
                  </span>
                </div>
                <p className="text-xs text-body-color dark:text-body-color-dark mt-1">
                  {formatTimeAgo(alert.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-body-color dark:text-body-color-dark">
              No active alerts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
