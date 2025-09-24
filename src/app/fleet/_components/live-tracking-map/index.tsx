"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import { MapIcon } from "@/components/Layouts/sidebar/icons";
import { RealGoogleMap } from "@/components/Maps/RealGoogleMap";
import { useState } from "react";

type PropsType = {
  className?: string;
};

export function LiveTrackingMap({ className }: PropsType) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  
  const { summary, stats, loading } = useDashboard();
  
  // Use real trips data from the API, fallback to mock data if not available
  const trips = stats?.trips?.results || [
    {
      id: 1,
      trip_id: "TRP-001",
      vehicle: "EV-001",
      driver: "John Doe",
      status: "in_progress",
      current_location: "Downtown",
      actual_start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    },
    {
      id: 2,
      trip_id: "TRP-002", 
      vehicle: "EV-002",
      driver: "Jane Smith",
      status: "in_progress",
      current_location: "Airport",
      actual_start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    }
  ];

  // Use real vehicle data from the API, fallback to mock data if not available
  const vehicles = stats?.vehicles?.results?.map((v: any) => ({
    id: v.id.toString(),
    name: v.name || v.license_plate,
    license_plate: v.license_plate,
    driver: v.driver?.name || "Unknown",
    status: v.status || "available",
    location: v.last_known_location ? 
      { lat: v.last_known_location.latitude, lng: v.last_known_location.longitude } :
      { lat: 40.7128, lng: -74.0060 }, // Default NYC location
    last_updated: v.last_updated || new Date().toISOString(),
    speed: v.current_speed || 0,
    battery_level: v.battery_level || 0,
  })) || [
    {
      id: "1",
      name: "EV-001",
      license_plate: "ABC-123",
      driver: "John Doe",
      status: "in_progress" as const,
      location: { lat: 40.7128, lng: -74.0060 },
      last_updated: new Date().toISOString(),
      speed: 45,
      battery_level: 85,
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "scheduled":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "scheduled":
        return "Scheduled";
      default:
        return "Unknown";
    }
  };

  const getStatusButtonColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-primary" />
              <h3 className="text-title-sm font-semibold text-dark dark:text-white">
                Real-time Fleet Location
              </h3>
            </div>
          </div>
          <p className="text-sm text-body-color dark:text-body-color-dark">
            Track your vehicles in real-time
          </p>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-primary" />
            <h3 className="text-title-sm font-semibold text-dark dark:text-white">
              Real-time Fleet Location
            </h3>
          </div>
          
          {/* Map/List Toggle Buttons */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                viewMode === "map"
                  ? "bg-white dark:bg-gray-600 text-dark dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-dark dark:hover:text-white"
              )}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-white dark:bg-gray-600 text-dark dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-dark dark:hover:text-white"
              )}
            >
              List
            </button>
          </div>
        </div>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Track your vehicles in real-time
        </p>
      </div>

      {viewMode === "map" ? (
        <>
          {/* Interactive Fleet Map */}
          <div className="relative mb-6 h-96 rounded-lg overflow-hidden">
            <RealGoogleMap
              center={{ lat: 40.7128, lng: -74.0060 }}
              zoom={12}
              className="h-full w-full"
              vehicles={[
                ...vehicles.map((v: any) => ({
                  id: v.id,
                  lat: v.location.lat,
                  lng: v.location.lng,
                  name: v.name,
                  status: v.status,
                  battery: v.battery_level
                })),
                // Add some demo vehicles for better visualization
                {
                  id: "demo-1",
                  lat: 40.7589,
                  lng: -73.9851,
                  name: "Fleet Vehicle #001",
                  status: "available",
                  battery: 85
                },
                {
                  id: "demo-2", 
                  lat: 40.7505,
                  lng: -73.9934,
                  name: "Fleet Vehicle #002",
                  status: "in_use",
                  battery: 67
                },
                {
                  id: "demo-3",
                  lat: 40.7614,
                  lng: -73.9776,
                  name: "Fleet Vehicle #003", 
                  status: "maintenance",
                  battery: 23
                },
                {
                  id: "demo-4",
                  lat: 40.7282,
                  lng: -73.9942,
                  name: "Fleet Vehicle #004",
                  status: "available",
                  battery: 92
                },
                {
                  id: "demo-5",
                  lat: 40.6892,
                  lng: -74.0445,
                  name: "Fleet Vehicle #005",
                  status: "offline",
                  battery: 15
                }
              ]}
            />
          </div>

          {/* Trip list */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-dark dark:text-white">
              Active Trips
            </h4>
            {trips.length > 0 ? (
              trips.map((trip: any) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${getStatusColor(trip.status)}`} />
                    <div>
                      <p className="text-sm font-medium text-dark dark:text-white">
                        {trip.vehicle} - {trip.trip_id}
                      </p>
                      <p className="text-xs text-body-color dark:text-body-color-dark">
                        {trip.driver} • {trip.current_location || 'Location unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusButtonColor(trip.status)
                    )}>
                      {getStatusText(trip.status)}
                    </span>
                    <p className="text-xs text-body-color dark:text-body-color-dark mt-1">
                      {formatTimeAgo(trip.actual_start_time)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🚗</div>
                <p className="text-body-color dark:text-body-color-dark">
                  No active trips
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* List View */
        <div className="overflow-x-auto">
          {trips.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                    Trip ID
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                    Vehicle
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                    Driver
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                    Status
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                    Location
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip: any) => (
                  <tr
                    key={trip.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(trip.status)}`} />
                        <span className="text-sm font-medium text-dark dark:text-white">
                          {trip.trip_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-body-color dark:text-body-color-dark">
                      {trip.vehicle}
                    </td>
                    <td className="py-4 text-sm text-body-color dark:text-body-color-dark">
                      {trip.driver}
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusButtonColor(trip.status)
                      )}>
                        {getStatusText(trip.status)}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-body-color dark:text-body-color-dark">
                      {trip.current_location || 'Unknown'}
                    </td>
                    <td className="py-4 text-sm text-body-color dark:text-body-color-dark">
                      {formatTimeAgo(trip.actual_start_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🚗</div>
              <p className="text-body-color dark:text-body-color-dark">
                No active trips
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
