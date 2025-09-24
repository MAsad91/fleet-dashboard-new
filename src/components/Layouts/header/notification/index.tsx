"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useGetActiveAlertsQuery, useMarkAlertsReadMutation } from "@/store/api/fleetApi";
import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "./icons";
import { AlertTriangle, Car, Wrench, Battery, Wifi, Shield } from "lucide-react";

// Helper function to get alert icon based on alert type
const getAlertIcon = (alertType: string, severity: string) => {
  const iconClass = `h-5 w-5 ${
    severity === 'critical' ? 'text-red-500' : 
    severity === 'high' ? 'text-orange-500' : 
    severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
  }`;
  
  switch (alertType.toLowerCase()) {
    case 'vehicle':
    case 'engine':
    case 'mechanical':
      return <Car className={iconClass} />;
    case 'maintenance':
    case 'service':
      return <Wrench className={iconClass} />;
    case 'battery':
    case 'power':
      return <Battery className={iconClass} />;
    case 'connectivity':
    case 'gps':
    case 'communication':
      return <Wifi className={iconClass} />;
    case 'security':
    case 'safety':
      return <Shield className={iconClass} />;
    default:
      return <AlertTriangle className={iconClass} />;
  }
};

// Helper function to format alert time
const formatAlertTime = (createdAt: string) => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Fetch active alerts
  const { data: alertsData, isLoading, error } = useGetActiveAlertsQuery({ 
    status: 'active', 
    limit: 5 
  });
  
  const [markAlertsRead] = useMarkAlertsReadMutation();
  
  // Get unread alerts count
  const unreadCount = alertsData?.results?.filter(alert => !alert.read).length || 0;
  
  // Handle alert click - mark as read and navigate to alerts page
  const handleAlertClick = async (alert: any) => {
    if (!alert.read) {
      try {
        await markAlertsRead({ ids: [alert.id] });
      } catch (error) {
        console.error('Failed to mark alert as read:', error);
      }
    }
    setIsOpen(false);
    // Navigate to alerts page with specific alert highlighted
    window.location.href = `/alerts?highlight=${alert.id}`;
  };

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Alerts
          </span>
          {unreadCount > 0 && (
            <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              Failed to load alerts
            </div>
          ) : !alertsData?.results || alertsData.results.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              No active alerts
            </div>
          ) : (
            alertsData.results.map((alert: any) => (
              <div
                key={alert.id}
                role="menuitem"
                onClick={() => handleAlertClick(alert)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer outline-none transition-colors",
                  alert.read 
                    ? "hover:bg-gray-2 dark:hover:bg-dark-3" 
                    : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                )}
              >
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.alert_type || alert.system || 'general', alert.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="block text-sm font-medium text-dark dark:text-white truncate">
                      {alert.title || alert.alert_type || alert.system || 'Alert'}
                    </strong>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatAlertTime(alert.created_at || alert.timestamp || new Date().toISOString())}
                    </span>
                  </div>

                  <p className="truncate text-sm text-dark-5 dark:text-dark-6 mt-1">
                    {alert.description || alert.message || alert.details || `${alert.vehicle_info?.license_plate || alert.vehicle || 'Vehicle'} - ${alert.severity || 'Alert'}`}
                  </p>
                  
                  {(alert.vehicle_info?.license_plate || alert.vehicle) && (
                    <span className="inline-block text-xs text-primary mt-1">
                      {alert.vehicle_info?.license_plate || alert.vehicle}
                    </span>
                  )}
                </div>

                {!alert.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                )}
              </div>
            ))
          )}
        </div>

        <Link
          href="/alerts"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          See all alerts
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
