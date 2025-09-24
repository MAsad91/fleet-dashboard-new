"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useGetTripsQuery } from "@/store/api/fleetApi";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Car, User, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActiveTripsTableProps {
  className?: string;
}

export function ActiveTripsTable({ className }: ActiveTripsTableProps) {
  const router = useRouter();
  const { stats } = useDashboard();
  const { data: tripsData, isLoading: tripsLoading, error: tripsError } = useGetTripsQuery({
    status: 'in_progress',
    limit: 10,
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just started';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}m`;
    return `${Math.floor(diffInMinutes / 1440)}d ${Math.floor((diffInMinutes % 1440) / 60)}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleTripClick = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  if (tripsLoading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const trips = tripsData?.results || stats?.trips?.results || [];

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark">
          Active Trips
        </h4>
        <button
          onClick={() => router.push('/trips')}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View All
        </button>
      </div>
      
      <div className="min-h-[300px] flex items-center justify-center">
        {tripsError ? (
          <div className="text-center">
            <MapPin className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load trips
            </p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No active trips
            </p>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            {trips.slice(0, 5).map((trip: any) => (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip.id)}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      <Play className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Trip #{trip.trip_id || trip.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {trip.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                          <Car className="h-3 w-3" />
                          <span>{trip.vehicle || trip.vehicle_id || 'N/A'}</span>
                        </div>
                        
                        {trip.driver && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                            <User className="h-3 w-3" />
                            <span>{trip.driver || trip.driver_id || 'N/A'}</span>
                          </div>
                        )}
                        
                        {trip.start_location && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{trip.start_location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(trip.actual_start_time || trip.start_time)}</span>
                    </div>
                    {trip.actual_start_time && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Duration: {formatDuration(trip.actual_start_time)}
                      </div>
                    )}
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
