"use client";

import { useDashboard } from "@/contexts/DashboardContext";
// import { useGetActiveAlertsQuery, useGetAlertsTrendsQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, AlertOctagon, Clock, Car, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface RecentAlertsTableProps {
  className?: string;
}

export function RecentAlertsTable({ className }: RecentAlertsTableProps) {
  const router = useRouter();
  const { stats } = useDashboard();
  // Use dashboard context data instead of individual API calls
  // const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useGetActiveAlertsQuery({
  //   status: 'open', // Try 'open' instead of 'active'
  //   limit: 5,
  // });

  // const { data: alertsTrends, isLoading: trendsLoading, error: trendsError } = useGetAlertsTrendsQuery({
  //   dateRange: 'today'
  // });

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleAlertClick = (alertId: string) => {
    router.push(`/alerts/${alertId}`);
  };


  const alerts = stats?.alerts?.results || [];

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark">
            Recent Alerts
          </h4>
          {/* Trend indicators removed - using dashboard data only */}
        </div>
        <button
          onClick={() => router.push('/alerts')}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View All
        </button>
      </div>
      
      <div className="min-h-[300px] flex items-center justify-center">
        {alerts.length === 0 ? (
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No active alerts
            </p>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            {alerts.slice(0, 5).map((alert: any) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert.id)}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        {alert.status === 'active' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {alert.title || alert.alert_title || 'Untitled Alert'}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {alert.description || alert.message || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Car className="h-3 w-3" />
                      <span>{alert.vehicle || alert.vehicle_id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(alert.created_at || alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
